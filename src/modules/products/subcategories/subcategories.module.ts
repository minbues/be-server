import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SubCategoriesService } from './subcategories.service';
import { SegmentsModule } from '../segments/segments.module';
import { SubCategoryEntity } from '../../../entities/sub-categories.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubCategoryEntity]),
    SegmentsModule,
    CategoriesModule,
  ],
  providers: [SubCategoriesService],
  exports: [SubCategoriesService],
})
export class SubCategoriesModule {}
