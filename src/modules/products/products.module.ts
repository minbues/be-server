import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { VariantEntity } from '../../entities/variants.entity';
import { VariantImageEntity } from '../../entities/variant-image.entity';
import { VariantSizeEntity } from '../../entities/variant-size.entity';
import { ProductEntity } from '../../entities/products.entity';
import { SegmentsModule } from './segments/segments.module';
import { ProductsController } from './products.controller';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoriesModule } from './subcategories/subcategories.module';
import { ProductsPublicController } from './products.public.controller';
import { ProductsService } from './products.service';
import { InventoryHelper } from './inventory.helper';
import { ReviewsModule } from './reviews/reviews.module';
import { WssModule } from '../wss/wss.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      VariantEntity,
      VariantImageEntity,
      VariantSizeEntity,
    ]),
    SegmentsModule,
    CategoriesModule,
    SubCategoriesModule,
    ReviewsModule,
    WssModule,
  ],
  controllers: [ProductsController, ProductsPublicController],
  providers: [PaginationHeaderHelper, ProductsService, InventoryHelper],
  exports: [ProductsService, InventoryHelper],
})
export class ProductsModule {}
