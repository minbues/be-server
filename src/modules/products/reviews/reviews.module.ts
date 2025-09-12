import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { PaginationHeaderHelper } from '../../../utils/pagination/pagination.helper';
import { ProductReviewEntity } from '../../../entities/product-review.entity';
import { ReviewService } from './reviews.service';
import { OrderItemEntity } from '../../../entities/order-items.entity';
import { OrdersModule } from '../../orders/orders.module';
import { OrderEntity } from '../../../entities/orders.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductReviewEntity,
      OrderItemEntity,
      OrderEntity,
    ]),
  ],
  providers: [ReviewService, PaginationHeaderHelper],
  exports: [ReviewService],
})
export class ReviewsModule {}
