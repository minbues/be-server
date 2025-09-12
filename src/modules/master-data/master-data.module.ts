import { Module } from '@nestjs/common';

import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { MasterDataEntity } from '../../entities/master-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MasterDataEntity])],
  controllers: [MasterDataController],
  exports: [MasterDataService],
  providers: [MasterDataService],
})
export class MasterDataModule {}
