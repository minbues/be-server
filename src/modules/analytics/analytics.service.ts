import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import { OrderItemEntity } from '../../entities/order-items.entity';
import { OrderEntity } from '../../entities/orders.entity';
import { ProductEntity } from '../../entities/products.entity';
import { UserEntity } from '../../entities/users.entity';
import { OrderStatusEnum, RevenueType, SellerType } from '../../utils/enum';
import { Between, Repository } from 'typeorm';
import { IPagination } from '../../utils/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemsRepository: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async getAnalytics() {
    const startDate = dayjs().startOf('month').toDate(); // ngày đầu tháng
    const endDate = dayjs()
      .endOf('month')
      .add(1, 'day')
      .startOf('day')
      .toDate();

    const totalRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'totalRevenue')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt < :endDate', { endDate })
      .andWhere('order.status = :status', { status: OrderStatusEnum.DELIVERED })
      .getRawOne();

    const totalRevenue = parseFloat(totalRevenueResult.totalRevenue || '0');

    const totalProductSoldResult = await this.orderItemsRepository
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .select('SUM(item.quantity)', 'totalProductSold')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt < :endDate', { endDate })
      .andWhere('order.status = :status', { status: OrderStatusEnum.DELIVERED })
      .getRawOne();

    const totalProductSold = parseInt(
      totalProductSoldResult.totalProductSold || '0',
    );

    const totalOrders = await this.orderRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
        status: OrderStatusEnum.DELIVERED,
      },
    });

    const totalNewCustomers = await this.userRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    return {
      totalRevenue,
      totalProductSold,
      totalOrders,
      totalNewCustomers,
    };
  }

  async getRevenue(
    type: RevenueType,
    year?: number,
    start?: string,
    end?: string,
  ) {
    switch (type) {
      case RevenueType.MONTH:
        if (year === undefined) {
          throw new BadRequestException('Year is required for monthly revenue');
        }
        return this.revenueByMonth(year);
      case RevenueType.QUARTER:
        if (year === undefined) {
          throw new BadRequestException(
            'Year is required for quarterly revenue',
          );
        }
        return this.revenueByQuarter(year);
      case RevenueType.YEAR:
        return this.revenueByYear();
      case RevenueType.RANGE:
        if (!start || !end) {
          throw new BadRequestException(
            'Start and end dates are required for range revenue',
          );
        }
        return this.revenueByRange(start, end);
      default:
        throw new BadRequestException('Invalid type');
    }
  }

  async revenueByMonth(year: number) {
    const selectedYear = Number(year) || new Date().getFullYear();
    const currentDate = new Date();
    const currentMonth =
      selectedYear === currentDate.getFullYear()
        ? currentDate.getMonth() + 1
        : 12;

    const rawData = await this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'MM/YYYY')", 'label')
      .addSelect('SUM(order.total)', 'revenue')
      .where('EXTRACT(YEAR FROM order.createdAt) = :year', {
        year: selectedYear,
      })
      .andWhere('order.status = :status', { status: OrderStatusEnum.DELIVERED })
      .groupBy("TO_CHAR(order.createdAt, 'MM/YYYY')")
      .getRawMany();

    const mapData = new Map<string, number>();
    rawData.forEach((item) => {
      mapData.set(item.label, parseFloat(item.revenue));
    });

    const result = Array.from({ length: currentMonth }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      const label = `${month}/${selectedYear}`;
      return {
        label,
        revenue: mapData.get(label) || 0,
      };
    });

    return result;
  }

  async revenueByQuarter(year: number) {
    const selectedYear = Number(year) || new Date().getFullYear();
    const currentDate = new Date();
    // Xác định quý hiện tại nếu là năm hiện tại, hoặc lấy 4 quý nếu năm khác
    const currentQuarter =
      selectedYear === currentDate.getFullYear()
        ? Math.ceil((currentDate.getMonth() + 1) / 3)
        : 4;

    const rawData = await this.orderRepository
      .createQueryBuilder('order')
      .select(
        `CONCAT('Q', EXTRACT(QUARTER FROM order.createdAt), '/', EXTRACT(YEAR FROM order.createdAt))`,
        'label',
      )
      .addSelect('SUM(order.total)', 'revenue')
      .where('EXTRACT(YEAR FROM order.createdAt) = :year', {
        year: selectedYear,
      })
      .andWhere('order.status = :status', { status: OrderStatusEnum.DELIVERED })
      .groupBy('label')
      .orderBy('label')
      .getRawMany();

    const mapData = new Map<string, number>();
    rawData.forEach((item) => {
      mapData.set(item.label, parseFloat(item.revenue));
    });

    const result = Array.from({ length: currentQuarter }, (_, i) => {
      const quarterNumber = i + 1;
      const label = `Q${quarterNumber}/${selectedYear}`;
      return {
        label,
        revenue: mapData.get(label) || 0,
      };
    });

    return result;
  }

  async revenueByYear() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 1; // 2 năm: năm nay và năm trước

    // Lấy dữ liệu từ db cho 2 năm này
    const rawData = await this.orderRepository
      .createQueryBuilder('order')
      .select(`EXTRACT(YEAR FROM order.createdAt)`, 'label')
      .addSelect(`SUM(order.total)`, 'revenue')
      .where('order.status = :status', { status: OrderStatusEnum.DELIVERED })
      .andWhere(
        'EXTRACT(YEAR FROM order.createdAt) BETWEEN :startYear AND :currentYear',
        {
          startYear,
          currentYear,
        },
      )
      .groupBy('label')
      .orderBy('label')
      .getRawMany();

    const mapData = new Map<number, number>();
    rawData.forEach((item) => {
      mapData.set(Number(item.label), parseFloat(item.revenue));
    });

    const result: { label: string; revenue: number }[] = [];
    for (let year = startYear; year <= currentYear; year++) {
      result.push({
        label: year.toString(),
        revenue: mapData.get(year) || 0,
      });
    }

    return result;
  }

  async revenueByRange(start: string, end: string) {
    const endPlusOne = dayjs(end).add(1, 'day').format('YYYY-MM-DD');

    const rawResult = await this.orderRepository
      .createQueryBuilder('order')
      .select(`TO_CHAR(order.createdAt, 'MM/YYYY')`, 'label')
      .addSelect(`SUM(order.total)`, 'revenue')
      .where('order.createdAt >= :start AND order.createdAt < :endPlusOne', {
        start,
        endPlusOne,
      })
      .andWhere('order.status = :status', { status: OrderStatusEnum.DELIVERED })
      .groupBy('label')
      .orderBy('label', 'ASC')
      .getRawMany();

    const startDate = dayjs(start).startOf('month');
    const endDate = dayjs(end).startOf('month');
    const monthsInRange: string[] = [];

    let current = startDate;
    while (current.isSameOrBefore(endDate)) {
      monthsInRange.push(current.format('MM/YYYY'));
      current = current.add(1, 'month');
    }

    // Tạo map từ DB result
    const resultMap = new Map(
      rawResult.map((item) => [item.label, Number(item.revenue)]),
    );

    // Trả về danh sách đầy đủ với doanh thu 0 nếu không có
    const result = monthsInRange.map((label) => ({
      label,
      revenue: resultMap.get(label) ?? 0,
    }));

    return result;
  }

  async getTopProducts(
    type: RevenueType,
    sellerType: SellerType,
    limit: number,
    year?: number,
    start?: string,
    end?: string,
  ) {
    const orderStatus = OrderStatusEnum.DELIVERED;
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case RevenueType.MONTH:
        if (!year)
          throw new BadRequestException('Year is required for monthly');
        startDate = dayjs(`${year}-01-01`).startOf('year').toDate();
        endDate = dayjs(`${year}-12-31`).endOf('year').add(1, 'day').toDate();
        break;
      case RevenueType.QUARTER:
        if (!year)
          throw new BadRequestException('Year is required for quarterly');
        startDate = dayjs(`${year}-01-01`).startOf('year').toDate();
        endDate = dayjs(`${year}-12-31`).endOf('year').add(1, 'day').toDate();
        break;
      case RevenueType.YEAR:
        startDate = dayjs().subtract(1, 'year').startOf('year').toDate();
        endDate = dayjs().endOf('year').add(1, 'day').toDate();
        break;
      case RevenueType.RANGE:
        if (!start || !end) {
          throw new BadRequestException('Start and end dates are required');
        }
        startDate = dayjs(start).startOf('day').toDate();
        endDate = dayjs(end).add(1, 'day').startOf('day').toDate();
        break;
      default:
        throw new BadRequestException('Invalid type');
    }

    const order = sellerType === SellerType.BEST ? 'DESC' : 'ASC';

    const result = await this.orderItemsRepository
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .where('order.status = :status', { status: orderStatus })
      .andWhere('order.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(item.quantity)', order)
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      label: item.productName,
      quantitySold: parseInt(item.totalSold),
    }));
  }

  async getProductsInventory(pagination: IPagination) {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('product.isArchived = :isArchived', {
      isArchived: false,
    });
    queryBuilder.andWhere('product.totalInventory > 0');

    queryBuilder.addOrderBy('product.totalInventory', 'DESC');

    queryBuilder.skip(pagination.startIndex);
    queryBuilder.take(pagination.perPage);

    const [products, total] = await queryBuilder.getManyAndCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return {
      headers: responseHeaders,
      items: products,
    };
  }
}
