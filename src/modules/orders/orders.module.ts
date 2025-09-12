import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from '../../entities/order-items.entity';
import { OrderEntity } from '../../entities/orders.entity';
import { VouchersModule } from '../voucher/voucher.module';
import { UsersModule } from '../users/users.module';
import { CartsModule } from '../carts/carts.module';
import { OrdersService } from './orders.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { WssModule } from '../wss/wss.module';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { ProductsModule } from '../products/products.module';
import { OrderPublicController } from './orders.public.controller';
import { OrderController } from './orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    VouchersModule,
    UsersModule,
    CartsModule,
    PaymentGatewayModule,
    WssModule,
    ProductsModule,
  ],
  controllers: [OrderPublicController, OrderController],
  providers: [OrdersService, PaginationHeaderHelper],
  exports: [OrdersService],
})
export class OrdersModule {}
