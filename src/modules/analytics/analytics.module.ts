import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from '../../entities/order-items.entity';
import { OrderEntity } from '../../entities/orders.entity';
import { ProductEntity } from '../../entities/products.entity';
import { UserEntity } from '../../entities/users.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      ProductEntity,
      UserEntity,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PaginationHeaderHelper],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
