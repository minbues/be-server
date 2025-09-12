import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsController } from './news.controller';
import { NewService } from './news.service';
import { NewsEntity } from '../../entities/news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity])],
  controllers: [NewsController],
  exports: [NewService],
  providers: [NewService],
})
export class NewsModule {}
