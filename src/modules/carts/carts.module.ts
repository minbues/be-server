import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from '../../entities/cart-item.entity';
import { CartEntity } from '../../entities/carts.entity';
import { ProductsModule } from '../products/products.module';
import { Module } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartController } from './carts.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartsModule {}
