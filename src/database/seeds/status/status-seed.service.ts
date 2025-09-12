import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusEntity } from '../../../entities/status.entity';
import { Repository } from 'typeorm';
import { StatusEnum } from '../../../utils/enum';

@Injectable()
export class StatusSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(StatusEntity)
    private repository: Repository<StatusEntity>,
  ) {}

  async onModuleInit() {
    await this.run();
  }

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.save([
        this.repository.create({
          id: StatusEnum.ACTIVE,
          name: 'Active',
        }),
        this.repository.create({
          id: StatusEnum.INACTIVE,
          name: 'Inactive',
        }),
      ]);
    }
  }
}
