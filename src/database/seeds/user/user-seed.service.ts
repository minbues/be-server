import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { UserEntity } from '../../../entities/users.entity';
import { RoleEnum, StatusEnum } from '../../../utils/enum';
import { config } from '../../../config/app.config';

const { email, password } = config.root;

@Injectable()
export class UserSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.run();
  }

  async run() {
    const countAdmin = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.ADMIN,
        },
      },
    });

    if (!countAdmin) {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);

      await this.repository.save(
        this.repository.create({
          firstName: 'Anh',
          lastName: 'Le',
          fullName: 'Le Thi Ngoc Anh',
          email: email,
          password: hashPassword,
          role: {
            id: RoleEnum.ADMIN,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.ACTIVE,
            name: 'Active',
          },
        }),
      );
    }
  }
}
