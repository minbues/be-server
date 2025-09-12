import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterDataEntity } from '../../../entities/master-data.entity';
import { Repository } from 'typeorm';
import { MasterDataEnum } from '../../../utils/enum';
import { masterDataInit } from '../master-data/init.data';

@Injectable()
export class MasterDataSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(MasterDataEntity)
    private repository: Repository<MasterDataEntity>,
  ) {}

  async onModuleInit() {
    await this.run();
  }

  async run() {
    const masterData = await this.repository.count();

    if (!masterData) {
      await this.repository.save(
        this.repository.create({
          data: masterDataInit,
          type: MasterDataEnum.MASTER,
        }),
      );
    }
  }
}
