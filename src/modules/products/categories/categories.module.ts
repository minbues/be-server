import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CategoryEntity } from '../../../entities/categories.entity';
import { CategoriesService } from './categories.service';
import { SegmentsModule } from '../segments/segments.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), SegmentsModule],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
