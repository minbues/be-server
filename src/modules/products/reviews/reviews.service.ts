import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderItemEntity } from '../../../entities/order-items.entity';
import { ProductReviewEntity } from '../../../entities/product-review.entity';
import { CreateReviewDto } from '../dto/review.dto';
import { OrderStatusEnum } from '../../../utils/enum';
import { ReviewMapper } from './reviews.mapper';
import { IPagination } from '../../../utils/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../../utils/pagination/pagination.helper';
import { OrderEntity } from '../../../entities/orders.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ProductReviewEntity)
    private readonly reviewRepo: Repository<ProductReviewEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async createReview(dto: CreateReviewDto, userId: number) {
    const orderItem = await this.orderItemRepo.findOne({
      where: { id: dto.orderItemId },
      relations: ['order', 'product'],
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    // Kiểm tra quyền
    if (orderItem.order.userId !== userId) {
      throw new BadRequestException('Bạn không thể đánh giá sản phẩm này');
    }

    if (orderItem.order.status !== OrderStatusEnum.DELIVERED) {
      throw new BadRequestException(
        'Chỉ được đánh giá khi đơn hàng đã được giao',
      );
    }

    if (orderItem.isReviewed) {
      throw new BadRequestException('Sản phẩm đã được đánh giá');
    }

    // Tạo review mới
    const review = this.reviewRepo.create({
      userId,
      orderItemId: orderItem.id,
      productId: orderItem.productId,
      rating: dto.rating,
      comment: dto.comment,
    });

    await this.reviewRepo.save(review);

    // Đánh dấu đã đánh giá
    orderItem.isReviewed = true;
    await this.orderItemRepo.save(orderItem);

    // 🟡 Tính lại averageRating & totalReviews
    const { avg, total } = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'total')
      .where('review.productId = :productId', {
        productId: orderItem.productId,
      })
      .andWhere('review.isActive = true') // nếu bạn dùng cờ isActive
      .getRawOne();

    await this.reviewRepo.manager.update('products', orderItem.productId, {
      averageRating: parseFloat(avg).toFixed(1),
      totalReviews: parseInt(total),
    });

    return await this.getOrderForReview(orderItem.orderId);
  }

  async getReviewsByProduct(productId: string, pagination: IPagination) {
    const queryBuilder = this.reviewRepo.createQueryBuilder('review');

    queryBuilder
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.orderItem', 'orderItem')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isActive = :isActive', { isActive: true })
      .orderBy('review.createdAt', 'DESC')
      .skip(pagination.startIndex)
      .take(pagination.perPage);

    const reviews = await queryBuilder.getMany();
    const total = await queryBuilder.getCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return {
      headers: responseHeaders,
      items: ReviewMapper.toDomainList(reviews),
    };
  }

  async getOrderForReview(orderId: string) {
    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('order.voucher', 'voucher')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.transactions', 'transactions')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('item.variant', 'variant')
      .leftJoinAndSelect('variant.images', 'images')
      .leftJoinAndSelect('item.review', 'review')
      .where('order.id = :orderId', { orderId })
      .orderBy('item.createdAt', 'ASC')
      .getOne();
  }
}
