import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemEntity } from '../../entities/order-items.entity';
import { OrderEntity } from '../../entities/orders.entity';
import { In, LessThan, Repository } from 'typeorm';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { CartService } from '../carts/carts.service';
import { VouchersService } from '../voucher/voucher.service';
import {
  DiscountType,
  InventoryModeEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  PointModeEnum,
} from '../../utils/enum';
import { OrderItemMapper } from './order-items.mapper';
import { BankService } from '../payment-gateway/bank/bank.service';
import { VietQRService } from '../payment-gateway/vietqr/vietqr.service';
import {
  generateOrderCode,
  generateRandomCode,
} from '../../utils/helpers/common.helper';
import { config } from '../../config/app.config';
import { SocketGateway } from '../wss/socket.gateway';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { IPagination } from '../../utils/pagination/pagination.interface';
import { TransactionBankEntity } from '../../entities/transactions.entity';
import { InventoryHelper } from '../../modules/products/inventory.helper';
import { UsersService } from '../users/users.service';
import { UserAddressService } from '../users/user-address.service';
const { term } = config.payment;
import { validate as isUuid } from 'uuid';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemsRepository: Repository<OrderItemEntity>,
    private readonly cartService: CartService,
    private readonly vouchersService: VouchersService,
    private readonly bankService: BankService,
    private readonly vietQRService: VietQRService,
    private readonly socketGateway: SocketGateway,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
    private readonly inventoryHelper: InventoryHelper,
    private readonly usersService: UsersService,
    private readonly userAddressService: UserAddressService,
  ) {}

  async createOrder(cartId: string, userId: number, dto: CreateOrderDto) {
    const cart = await this.cartService.getCartToOrder(cartId, userId);

    if (!cart || !cart.items.length) {
      throw new BadRequestException('Giỏ hàng không hợp lệ hoặc trống');
    }

    const address = await this.userAddressService.findOne(dto.addressId);
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');

    // === Bắt đầu kiểm tra và chuẩn bị voucher ===
    let discount = 0;
    let type: DiscountType = DiscountType.FIXED;

    if (dto.voucherId) {
      const voucher = await this.vouchersService.applyVoucher(
        userId,
        dto.voucherId,
      );
      if (!voucher.available) {
        throw new BadRequestException(voucher.message);
      }
      discount = voucher.discount;
      type = voucher.type!;
    }

    // === Tính toán tổng phụ ===
    const subtotal = cart.items.reduce((sum, item) => {
      const priceAfterDiscount = item.product.discount
        ? Number(item.product.price) * (1 - Number(item.product.discount) / 100)
        : Number(item.product.price);
      return sum + priceAfterDiscount * item.quantity;
    }, 0);

    // === Áp dụng giảm giá voucher ===
    let discountAmount =
      type === DiscountType.PERCENT ? (subtotal * discount) / 100 : discount;

    // === Kiểm tra điểm và trừ trước (rollback nếu fail sau này) ===
    let pointDiscount = 0;
    if (dto.point) {
      pointDiscount = Number(dto.point);
      await this.usersService.updatePoint(
        userId,
        pointDiscount,
        PointModeEnum.SUBTRACT,
      );
    }

    const total = subtotal - discountAmount - pointDiscount;

    // === Chuẩn bị dữ liệu QR nếu là BANKING (check trước khi lưu order) ===
    let qr = null;
    const code = generateRandomCode(6);

    if (dto.paymentMethod === PaymentMethodEnum.BANKING) {
      const bank = await this.bankService.getBankWithFurthestLastOrder();
      if (!bank)
        throw new BadRequestException('Không có tài khoản thụ hưởng hợp lệ');

      const infor = generateOrderCode(userId, new Date(), code);
      qr = await this.vietQRService.generateQR({
        accountNo: bank.accountNo,
        accountName: bank.accountName,
        acqId: bank.acqId,
        amount: Number(total),
        addInfo: infor,
      });
    }

    // === Tạo đơn hàng sau khi đã kiểm tra tất cả điều kiện ===
    const order = await this.orderRepository.save({
      userId,
      addressId: dto.addressId,
      address,
      voucherId: dto.voucherId,
      subtotal,
      discount,
      total,
      status:
        dto.paymentMethod === PaymentMethodEnum.BANKING
          ? OrderStatusEnum.PENDING
          : OrderStatusEnum.PROCESSING,
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatusEnum.UNPAID,
      code: code,
      paymentExpiredAt: new Date(
        new Date().getTime() + Number(term) * 60 * 1000,
      ),
      pointUsed: pointDiscount,
      qr,
    });

    // === Sau khi tạo order xong mới thao tác DB còn lại ===
    if (dto.voucherId) {
      await this.vouchersService.useVoucher(userId, dto.voucherId);
    }

    const orderItems = OrderItemMapper.toEntityList(cart.items, order);
    await this.orderItemsRepository.save(orderItems);

    await this.cartService.deleteAllCartItem(cartId);

    await this.inventoryHelper.updateInventoryQuantities(
      orderItems,
      InventoryModeEnum.DECREASE,
    );

    if (dto.paymentMethod === PaymentMethodEnum.BANKING) {
      this.startPaymentCountdown(order, orderItems, pointDiscount);
      return {
        type: PaymentMethodEnum.BANKING,
        order,
        qr,
      };
    }

    return {
      type: PaymentMethodEnum.COD,
      order,
      qr: null,
    };
  }

  private startPaymentCountdown(
    order: OrderEntity,
    orderItems: OrderItemEntity[],
    pointDiscount: number,
  ): void {
    const now = new Date();
    const expiryTime = new Date(order.paymentExpiredAt);
    const timeRemaining = expiryTime.getTime() - now.getTime();

    setTimeout(async () => {
      const latestOrder = await this.orderRepository.findOne({
        where: {
          id: order.id,
        },
      });

      if (
        !latestOrder ||
        latestOrder.status !== OrderStatusEnum.PENDING ||
        latestOrder.paymentStatus !== PaymentStatusEnum.UNPAID
      ) {
        return;
      }

      await this.cancelOrder(order);
      await this.inventoryHelper.updateInventoryQuantities(
        orderItems,
        InventoryModeEnum.INCREASE,
      );
      if (order.voucherId) {
        await this.vouchersService.refundVoucher(order.userId, order.voucherId);
      }
      if (pointDiscount !== 0) {
        await this.usersService.updatePoint(
          order.userId,
          pointDiscount,
          PointModeEnum.ADD,
        );
      }
      this.socketGateway.sendPaymentExpiredNotification(
        order.userId,
        latestOrder,
      );
    }, timeRemaining);
  }

  // Hủy đơn hàng khi hết thời gian thanh toán
  private async cancelOrder(order: OrderEntity): Promise<void> {
    order.status = OrderStatusEnum.CANCELLED;
    order.paymentStatus = PaymentStatusEnum.UNPAID;
    await this.orderRepository.save(order);
    this.logger.log(
      `Order ${order.id} has been cancelled due to payment expiration.`,
    );
  }

  async cancelExpiredUnpaidOrders(): Promise<number> {
    const expiredTime = new Date(Date.now() - 15 * 60 * 1000);

    const expiredOrders = await this.orderRepository.find({
      where: {
        status: OrderStatusEnum.PENDING,
        paymentStatus: PaymentStatusEnum.UNPAID,
        createdAt: LessThan(expiredTime),
      },
    });

    for (const order of expiredOrders) {
      order.status = OrderStatusEnum.CANCELLED;
      await this.orderRepository.save(order);
    }

    return expiredOrders.length;
  }

  async getOrderByUserId(userId: number, pagination: IPagination) {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: userId } },
      relations: [
        'items',
        'voucher',
        'address',
        'transactions',
        'items.product',
        'items.variant.images',
        'items.review',
      ],
      skip: pagination.startIndex,
      take: pagination.perPage,
      order: { createdAt: 'DESC' },
    });

    orders.forEach((order) => {
      order.items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return { headers: responseHeaders, items: orders };
  }

  async manualOrderCancellation(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        status: In([
          OrderStatusEnum.PROCESSING,
          OrderStatusEnum.PENDING,
          OrderStatusEnum.CONFIRMED,
        ]),
      },
      relations: ['items'],
    });

    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }

    await this.inventoryHelper.updateInventoryQuantities(
      order.items,
      InventoryModeEnum.INCREASE,
    );

    order.status = OrderStatusEnum.CANCELLED;
    await this.orderRepository.save(order);
    let pointRefund = Number(order.pointUsed || 0);

    if (
      order.paymentStatus === PaymentStatusEnum.PAID &&
      order.paymentMethod === PaymentMethodEnum.BANKING
    ) {
      order.paymentStatus = PaymentStatusEnum.REFUNDED;
      pointRefund = order.total;
    } else {
      pointRefund = order.pointUsed;
    }

    console.log('pointRefund', pointRefund);
    await this.usersService.updatePoint(
      order.userId,
      pointRefund,
      PointModeEnum.ADD,
    );

    await this.orderRepository.save(order);
    return order;
  }

  async handlePaymentOrder(
    userId: number,
    code: string,
    transactionId: string,
    transaction: TransactionBankEntity,
  ) {
    const order = await this.orderRepository.findOneBy({
      userId,
      code,
    });

    if (!order) {
      Logger.warn('Order not found');
      return;
    }

    order.transactionId = transactionId;
    order.transactions = transaction;
    order.status = OrderStatusEnum.PROCESSING;
    order.paymentStatus = PaymentStatusEnum.PAID;

    await this.orderRepository.save(order);

    await this.socketGateway.sendOrderPaidNotification(order.userId, order);
  }

  async getOrdersWithPaging(pagination: IPagination, search?: string) {
    const excludedStatuses = [OrderStatusEnum.PENDING];
    const excludePaymentStatus = [PaymentStatusEnum.PENDING];

    const exclusionConditions = [
      {
        status: OrderStatusEnum.CANCELLED,
        paymentMethod: PaymentMethodEnum.BANKING,
        paymentStatus: PaymentStatusEnum.UNPAID,
      },
    ];

    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.voucher', 'voucher')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.transactions', 'transactions')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .leftJoinAndSelect('variant.images', 'images')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.status NOT IN (:...excludedStatuses)', { excludedStatuses })
      .andWhere('order.paymentStatus NOT IN (:...excludePaymentStatus)', {
        excludePaymentStatus,
      });

    exclusionConditions.forEach((condition, index) => {
      query.andWhere(
        `NOT (
        order.status = :status${index} AND
        order.paymentMethod = :paymentMethod${index} AND
        order.paymentStatus = :paymentStatus${index}
      )`,
        {
          [`status${index}`]: condition.status,
          [`paymentMethod${index}`]: condition.paymentMethod,
          [`paymentStatus${index}`]: condition.paymentStatus,
        },
      );
    });

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;

      if (isUuid(search.trim())) {
        query.andWhere('CAST(order.id AS TEXT) LIKE :searchTerm', {
          searchTerm,
        });
      } else {
        query.andWhere('user.fullName ILIKE :searchTerm', { searchTerm });
      }
    }

    query
      .skip(pagination.startIndex)
      .take(pagination.perPage)
      .orderBy('order.createdAt', 'DESC');

    const [orders, total] = await query.getManyAndCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return { headers: responseHeaders, items: orders };
  }

  async getOrderById(orderId: string) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .where('order.id = :id', { id: orderId })
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.voucher', 'voucher')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.transactions', 'transactions')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .leftJoinAndSelect('variant.images', 'images')
      .leftJoinAndSelect('order.user', 'user');
    const order = await query.getOne();
    return order;
  }

  async manunalOrderUpdate(orderId: string, dto: UpdateOrderDto) {
    if (dto.status === OrderStatusEnum.CANCELLED) {
      await this.manualOrderCancellation(orderId);
      return await this.getOrderById(orderId);
    } else {
      const order = await this.orderRepository.findOneBy({ id: orderId });

      if (!order) {
        throw new NotFoundException('Order không tồn tại');
      }
      order.status = dto.status;
      if (
        order.paymentMethod === PaymentMethodEnum.COD &&
        dto.status === OrderStatusEnum.DELIVERED
      ) {
        order.paymentStatus = PaymentStatusEnum.PAID;
      }
      await this.orderRepository.save(order);
      return await this.getOrderById(orderId);
    }
  }

  async getDetailPaymentByOrderId(orderId: string) {
    const result = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'items',
        'items.product',
        'items.variant',
        'items.variant.images',
      ],
    });

    if (!result) throw new NotFoundException('Đơn hàng không tồn tại');
    return {
      order: result,
      type: result.paymentMethod,
      qr: result.qr || null,
    };
  }
}
