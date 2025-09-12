import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterDataEntity } from '../../../entities/master-data.entity';
import { MasterDataSeedService } from './master-data-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterDataEntity])],
  providers: [MasterDataSeedService],
  exports: [MasterDataSeedService],
})
export class MasterDataSeedModule {}
