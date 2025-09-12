import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEventEntity } from '../../entities/discount-event.entity';
import { EventsService } from './event.service';
import { Module } from '@nestjs/common';
import { EventsController } from './event.controller';
import { ProductsModule } from '../products/products.module';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountEventEntity]), ProductsModule],
  exports: [EventsService],
  controllers: [EventsController],
  providers: [EventsService, PaginationHeaderHelper],
})
export class EventsModule {}
