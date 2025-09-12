import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../../../entities/roles.entity';
import { Repository } from 'typeorm';
import { RoleEnum } from '../../../utils/enum';

@Injectable()
export class RoleSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  async onModuleInit() {
    await this.run();
  }

  async run() {
    const countUser = await this.repository.count({
      where: {
        id: RoleEnum.USER,
      },
    });

    if (!countUser) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.USER,
          name: 'User',
        }),
      );
    }

    const countAdmin = await this.repository.count({
      where: {
        id: RoleEnum.ADMIN,
      },
    });

    if (!countAdmin) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.ADMIN,
          name: 'Admin',
        }),
      );
    }
  }
}
