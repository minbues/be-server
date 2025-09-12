import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  CreateScheduleDTO,
  UpdateScheduleDTO,
} from './dto/events.schedule.dto';
import { In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { DiscountEventEntity } from '../../entities/discount-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEventEnum, EventStatusEnum } from '../../utils/enum';
import { ProductsService } from '../products/products.service';
import { IPagination } from '../../utils/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(DiscountEventEntity)
    private readonly eventScheduleRepo: Repository<DiscountEventEntity>,
    private readonly productService: ProductsService,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async getEventSchedule() {
    const now = new Date();

    const events = await this.eventScheduleRepo.find({
      where: {
        status: In([EventStatusEnum.IN_COMING, EventStatusEnum.ON_GOING]),
      },
    });
    for (const event of events) {
      if (now >= event.startTime && now <= event.endTime) {
        // Nếu đang trong khoảng thời gian, chuyển sang ON_GOING nếu chưa
        if (event.status !== EventStatusEnum.ON_GOING) {
          await this.eventScheduleRepo.update(event.id, {
            status: EventStatusEnum.ON_GOING,
          });
        }

        // Áp dụng sự kiện nếu cần
        await this.setDiscountEvent(event);
      } else if (now > event.endTime) {
        // Nếu đã kết thúc, đánh dấu COMPLETE
        if (event.status !== EventStatusEnum.COMPLETED) {
          await this.eventScheduleRepo.update(event.id, {
            status: EventStatusEnum.COMPLETED,
          });
        }
        event.discount = 0;
        await this.setDiscountEvent(event);
      }
    }
    return events;
  }

  async createEventSchedule(event: CreateScheduleDTO) {
    const existed = await this.eventScheduleRepo.findOne({
      where: {
        name: event.name,
        pid: event.pid,
        type: event.type,
        startTime: LessThan(new Date(event.endTime)),
        endTime: MoreThan(new Date(event.startTime)),
      },
    });

    if (existed) {
      throw new BadRequestException(
        'Đã có sự kiện đã tồn tại trong khoảng thời gian này',
      );
    }

    const newEvent = this.eventScheduleRepo.create({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    });

    return await this.eventScheduleRepo.save(newEvent);
  }

  async setDiscountEvent(event: DiscountEventEntity) {
    if (!event) {
      return;
    }
    switch (event.type) {
      case DiscountEventEnum.ALL_SHOP:
        this.productService.applyAllShopDiscount(event);
        break;
      case DiscountEventEnum.CATEGORY:
        await this.productService.applyCategoryDiscount(event);
        break;
      case DiscountEventEnum.SUBCATEGORY:
        await this.productService.applySubCategoryDiscount(event);
        break;
      default:
        this.logger.log(`Loại sự kiện không được hỗ trợ: ${event.type}`);
        break;
    }
  }

  async deleteEventSchedule(eventId: string) {
    const event = await this.eventScheduleRepo.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new BadRequestException('Sự kiện không tồn tại');
    }

    // Nếu sự kiện đang diễn ra, reset giảm giá
    if (event.status === EventStatusEnum.ON_GOING) {
      event.discount = 0;
      await this.setDiscountEvent(event);
    }

    await this.eventScheduleRepo.delete(eventId);
    this.logger.log(`Đã xoá sự kiện ID: ${eventId}`);
  }

  async updateEventSchedule(id: string, data: UpdateScheduleDTO) {
    const event = await this.eventScheduleRepo.findOne({ where: { id } });

    if (!event) {
      throw new BadRequestException('Sự kiện không tồn tại');
    }

    // Chuẩn hóa thời gian mới (nếu có)
    const newStart = data.startTime
      ? new Date(data.startTime)
      : event.startTime;
    const newEnd = data.endTime ? new Date(data.endTime) : event.endTime;

    // Kiểm tra overlap với các sự kiện khác (cùng pid và type)
    const conflict = await this.eventScheduleRepo.findOne({
      where: {
        id: Not(id),
        pid: data.pid ?? event.pid,
        type: data.type ?? event.type,
        startTime: LessThan(newEnd),
        endTime: MoreThan(newStart),
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'Đã có sự kiện khác trùng thời gian với sự kiện đang cập nhật',
      );
    }

    // Cập nhật các giá trị mới
    const updated = {
      ...event,
      ...data,
      startTime: newStart,
      endTime: newEnd,
    };
    event.discount = data.discount;
    await this.eventScheduleRepo.update(id, updated);
    await this.setDiscountEvent(event);
    return this.eventScheduleRepo.findOne({ where: { id } });
  }

  async getEvents(search: string, pagination: IPagination) {
    console.log('search', search);
    const queryBuilder = this.eventScheduleRepo.createQueryBuilder('event');

    // Lấy tất cả các status
    queryBuilder.where('event.status IN (:...statuses)', {
      statuses: [
        EventStatusEnum.ON_GOING,
        EventStatusEnum.IN_COMING,
        EventStatusEnum.COMPLETED,
      ],
    });

    if (typeof search === 'string' && search.trim() !== '') {
      queryBuilder.andWhere('LOWER(event.name) ILIKE LOWER(:search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    // Sắp xếp theo thứ tự: ON_GOING lên đầu, IN_COMING giữa (theo startTime tăng dần), COMPLETED cuối cùng
    queryBuilder.addOrderBy(
      `CASE
      WHEN event.status = '${EventStatusEnum.ON_GOING}' THEN 0
      WHEN event.status = '${EventStatusEnum.IN_COMING}' THEN 1
      WHEN event.status = '${EventStatusEnum.COMPLETED}' THEN 2
      ELSE 3
    END`,
      'ASC',
    );

    // Với IN_COMING thì ưu tiên startTime gần nhất nên orderBy startTime ASC
    queryBuilder.addOrderBy('event.startTime', 'ASC');

    // Phân trang
    queryBuilder.skip(pagination.startIndex);
    queryBuilder.take(pagination.perPage);

    const events = await queryBuilder.getMany();
    const total = await queryBuilder.getCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return {
      headers: responseHeaders,
      items: events,
    };
  }

  async getEventOnGoing() {
    const events = await this.eventScheduleRepo.findOne({
      where: {
        status: In([EventStatusEnum.ON_GOING]),
      },
    });

    if (!events) return null;
    return {
      key: 'events',
      type: 'event',
      label: events.name.toUpperCase(),
      eventType: events.type,
      pid: events.pid,
    };
  }
}
