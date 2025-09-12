import { SegmentEntity } from '../../../entities/segments.entity';
import { SegmentsService } from './segments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PaginationHeaderHelper } from '../../../utils/pagination/pagination.helper';

@Module({
  imports: [TypeOrmModule.forFeature([SegmentEntity])],
  providers: [SegmentsService, PaginationHeaderHelper],
  exports: [SegmentsService],
})
export class SegmentsModule {}
