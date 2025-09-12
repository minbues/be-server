import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VoucherUserEntity } from '../../entities/voucher-user.entity';
import { VoucherEntity } from '../../entities/voucher.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateVoucherDto, GetVoucherDto } from './dto/voucher.dto';
import { UsersService } from '../users/users.service';
import { IPagination } from '../../utils/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { replaceQuerySearch } from '../../utils/helpers/common.helper';
import removeAccents from 'remove-accents';
import { isUUID } from 'class-validator';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(VoucherEntity)
    private readonly voucherRepo: Repository<VoucherEntity>,
    @InjectRepository(VoucherUserEntity)
    private readonly voucherUserRepo: Repository<VoucherUserEntity>,
    private readonly usersService: UsersService,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  // Tạo voucher
  async createVoucher(dto: CreateVoucherDto) {
    const existed = await this.voucherRepo.findOne({
      where: { code: dto.code },
    });
    if (existed) throw new BadRequestException('Mã voucher đã tồn tại');

    const voucher = this.voucherRepo.create({ ...dto, isActive: true });
    const saved = await this.voucherRepo.save(voucher);

    // Nếu là voucher unlimit (không giới hạn số lượng) → phát cho tất cả user
    if (!dto.quantity) {
      const allUsers = await this.usersService.findAll();
      const voucherUsers = allUsers.map((user) =>
        this.voucherUserRepo.create({
          user,
          voucher: saved,
          isUsed: false,
        }),
      );
      await this.voucherUserRepo.save(voucherUsers);
    }

    return saved;
  }

  async useVoucher(userId: number, codeOrId: string) {
    const whereConditions: any[] = [{ code: codeOrId }];

    if (isUUID(codeOrId)) {
      whereConditions.push({ id: codeOrId });
    }

    const voucher = await this.voucherRepo.findOne({
      where: whereConditions,
      relations: ['voucherUsers'],
    });

    if (!voucher) throw new NotFoundException('Voucher không tồn tại');
    if (!voucher.isActive)
      throw new BadRequestException('Voucher không hoạt động');

    const now = new Date();
    if (now < voucher.startDate)
      throw new BadRequestException('Voucher chưa bắt đầu');
    if (now > voucher.endDate) throw new BadRequestException('Voucher hết hạn');

    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User không hợp lệ');

    // Kiểm tra nếu đã từng sử dụng voucher này
    const existed = await this.voucherUserRepo.findOne({
      where: {
        user: { id: userId },
        voucher: { id: voucher.id },
      },
    });

    if (existed) {
      if (existed.isUsed)
        throw new BadRequestException('Bạn đã sử dụng voucher này rồi');
      existed.isUsed = true;
      await this.voucherUserRepo.save(existed);
    } else {
      // Nếu là voucher limit → kiểm tra số lượng và đánh dấu đã dùng
      if (voucher.quantity) {
        const usedCount = await this.voucherUserRepo.count({
          where: { voucher: { id: voucher.id }, isUsed: true },
        });

        if (usedCount >= voucher.quantity)
          throw new BadRequestException('Voucher đã hết lượt sử dụng');
      }

      // Lưu mới voucher-user
      try {
        await this.voucherUserRepo.save({
          user,
          voucher,
          isUsed: true,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: any) {
        throw new BadRequestException('Bạn chỉ được dùng voucher 1 lần');
      }
    }

    return { success: true, discount: voucher.discount };
  }

  async applyVoucher(userId: number, codeOrId: string) {
    const whereConditions: any[] = [{ code: codeOrId }];

    if (isUUID(codeOrId)) {
      whereConditions.push({ id: codeOrId });
    }

    const voucher = await this.voucherRepo.findOne({
      where: whereConditions,
      relations: ['voucherUsers'],
    });

    if (!voucher) {
      return {
        available: false,
        discount: 0,
        type: null,
        id: null,
        message: 'Voucher không tồn tại',
      };
    }
    if (!voucher.isActive) {
      return {
        available: false,
        discount: 0,
        type: voucher.type,
        id: voucher.id,
        message: 'Voucher không hoạt động',
      };
    }
    const now = new Date();
    if (now < voucher.startDate) {
      return {
        available: false,
        discount: 0,
        type: voucher.type,
        id: voucher.id,
        message: 'Voucher chưa bắt đầu',
      };
    }

    if (now > voucher.endDate) {
      return {
        available: false,
        discount: 0,
        type: voucher.type,
        id: voucher.id,
        message: 'Voucher đã hết hạn',
      };
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User không hợp lệ');

    // Kiểm tra nếu đã từng sử dụng voucher này
    const existed = await this.voucherUserRepo.findOne({
      where: {
        user: { id: userId },
        voucher: { id: voucher.id },
      },
    });

    if (existed) {
      if (existed.isUsed) {
        return {
          available: false,
          discount: 0,
          type: voucher.type,
          id: voucher.id,
          message: 'Bạn đã sử dụng voucher này rồi',
        };
      }
    } else {
      // Nếu là voucher limit → kiểm tra số lượng và đánh dấu đã dùng
      if (voucher.quantity) {
        const usedCount = await this.voucherUserRepo.count({
          where: { voucher: { id: voucher.id }, isUsed: true },
        });

        if (usedCount >= voucher.quantity) {
          return {
            available: false,
            discount: 0,
            type: voucher.type,
            id: voucher.id,
            message: 'Voucher đã hết lượt sử dụng',
          };
        }
      }
    }

    return {
      available: true,
      discount: voucher.discount,
      type: voucher.type,
      id: voucher.id,
      message: 'Voucher hợp lệ',
    };
  }

  async getVoucherByCode(userId: number, code: string) {
    const voucher = await this.voucherRepo.findOne({
      where: { code },
      relations: ['voucherUsers'],
    });

    if (!voucher) {
      return {
        message: 'Voucher không tồn tại',
        id: null,
        code: null,
        discount: 0,
        type: null,
        startDate: null,
        endDate: null,
        status: false,
      };
    }

    if (!voucher.isActive) {
      return {
        message: 'Voucher không hoạt động',
        id: voucher.id,
        code: voucher.code,
        discount: voucher.discount,
        type: voucher.type,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        status: false,
      };
    }

    const now = new Date();
    if (now < voucher.startDate) {
      return {
        message: 'Voucher chưa bắt đầu',
        id: voucher.id,
        code: voucher.code,
        discount: voucher.discount,
        type: voucher.type,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        status: false,
      };
    }
    if (now > voucher.endDate) {
      return {
        message: 'Voucher hết hạn',
        id: voucher.id,
        code: voucher.code,
        discount: voucher.discount,
        type: voucher.type,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        status: false,
      };
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User không hợp lệ');

    const existed = await this.voucherUserRepo.findOne({
      where: {
        user: { id: userId },
        voucher: { id: voucher.id },
      },
    });

    if (existed) {
      if (existed.isUsed) {
        return {
          message: 'Bạn đã sử dụng voucher này rồi',
          id: voucher.id,
          code: voucher.code,
          discount: voucher.discount,
          type: voucher.type,
          startDate: voucher.startDate,
          endDate: voucher.endDate,
          status: false,
        };
      }
    } else {
      if (voucher.quantity) {
        const usedCount = await this.voucherUserRepo.count({
          where: { voucher: { id: voucher.id }, isUsed: true },
        });

        if (usedCount >= voucher.quantity) {
          return {
            message: 'Voucher đã hết lượt sử dụng',
            id: voucher.id,
            code: voucher.code,
            discount: voucher.discount,
            type: voucher.type,
            startDate: voucher.startDate,
            endDate: voucher.endDate,
            status: false,
          };
        }
      }
    }

    return {
      id: voucher.id,
      code: voucher.code,
      discount: voucher.discount,
      type: voucher.type,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
      status: true,
      message: 'Voucher hợp lệ',
    };
  }

  async getListVoucherValidByUserId(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User không hợp lệ');

    // Lấy danh sách các voucher mà người dùng chưa sử dụng
    const vouchers = await this.voucherRepo.find({
      where: [
        {
          isActive: true,
          startDate: LessThanOrEqual(new Date()),
          endDate: MoreThanOrEqual(new Date()),
        }, // Voucher còn hạn
      ],
      relations: ['voucherUsers'],
    });

    const validVouchers = vouchers.filter((voucher) => {
      // Kiểm tra xem voucher có giới hạn số lượng hay không và người dùng chưa sử dụng
      const voucherUsed = (voucher.voucherUsers ?? []).some(
        (vu) => vu.user && vu.user.id === userId && vu.isUsed,
      );
      return !voucherUsed;
    });

    return validVouchers.map((voucher) => ({
      id: voucher.id,
      code: voucher.code,
      discount: voucher.discount,
      type: voucher.type,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
    }));
  }

  async findVouchersWithConditions(
    query: GetVoucherDto,
    pagination: IPagination,
  ) {
    const queryBuilder = this.voucherRepo.createQueryBuilder('voucher');

    // Áp dụng điều kiện tìm kiếm theo mã voucher nếu có
    if (query?.code) {
      const code = removeAccents(replaceQuerySearch(query.code));
      queryBuilder.andWhere('LOWER(voucher.code) ILIKE LOWER(:code)', {
        code: `%${code.toLowerCase()}%`,
      });
    }

    // Áp dụng điều kiện tìm theo trạng thái isActive nếu có
    if (query?.isActive !== undefined) {
      queryBuilder.andWhere('voucher.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    queryBuilder.orderBy('voucher.createdAt', 'DESC');

    queryBuilder.skip(pagination.startIndex);
    queryBuilder.take(pagination.perPage);

    const vouchers = await queryBuilder.getMany();

    // Lấy tổng số lượng vouchers để phân trang
    const total = await queryBuilder.getCount();

    // Tính số lượt sử dụng cho từng voucher
    const vouchersWithUsage = await Promise.all(
      vouchers.map(async (voucher) => {
        const usageCount = await this.voucherUserRepo.count({
          where: { voucher: { id: voucher.id }, isUsed: true },
        });
        return {
          ...voucher,
          usageCount, // Thêm số lượt sử dụng vào kết quả
        };
      }),
    );

    // Tạo header phân trang
    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return {
      headers: responseHeaders,
      items: vouchersWithUsage,
    };
  }

  async delete(voucherId: string) {
    const voucher = await this.voucherRepo.findOne({
      where: { id: voucherId },
      relations: ['voucherUsers'],
    });

    if (!voucher) {
      throw new NotFoundException('Voucher không tồn tại');
    }

    if (voucher.voucherUsers && voucher.voucherUsers.length > 0) {
      await this.voucherUserRepo.softDelete({ voucher: { id: voucherId } });
    }

    await this.voucherRepo.softDelete(voucherId);
  }

  async updateVoucher(voucherId: string, dto: CreateVoucherDto) {
    const voucher = await this.voucherRepo.findOne({
      where: { id: voucherId },
      relations: ['voucherUsers'],
    });

    if (!voucher) {
      throw new NotFoundException('Voucher không tồn tại');
    }

    const usedCount = await this.voucherUserRepo.count({
      where: { voucher: { id: voucherId }, isUsed: true },
    });

    if (dto.quantity !== undefined && dto.quantity < usedCount) {
      throw new BadRequestException(
        `Số lượng mới (${dto.quantity}) không thể nhỏ hơn số lượng đã sử dụng (${usedCount})`,
      );
    }

    if (dto.quantity !== undefined && dto.quantity > usedCount) {
      const unusedVouchers = await this.voucherUserRepo.find({
        where: { voucher: { id: voucherId }, isUsed: false },
        order: { createdAt: 'ASC' },
      });

      const excessCount = unusedVouchers.length - (dto.quantity - usedCount);
      if (excessCount > 0) {
        const vouchersToDelete = unusedVouchers.slice(0, excessCount);
        await this.voucherUserRepo.softRemove(vouchersToDelete);
      }
    }

    Object.assign(voucher, dto);
    return await this.voucherRepo.save(voucher);
  }

  async refundVoucher(userId: number, voucherId: string) {
    const voucher = await this.voucherRepo.findOne({
      where: { id: voucherId },
      relations: ['voucherUsers'],
    });

    if (!voucher) {
      throw new NotFoundException('Voucher không tồn tại');
    }

    await this.voucherUserRepo.update(
      {
        voucher: { id: voucherId },
        user: { id: userId },
        isUsed: true,
      },
      {
        isUsed: false,
      },
    );
  }
}
