import { Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/users.entity';
import { UserVerifyEntity } from '../../entities/user-verify.entity';
import { UserAddressEntity } from '../../entities/user-address.entity';
import { UsersController } from './users.controller';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { UsersVerifyService } from './users-verify.service';
import { UserAddressController } from './user-address.controller';
import { UserAddressService } from './user-address.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserVerifyEntity, UserAddressEntity]),
  ],
  controllers: [UsersController, UserAddressController],
  providers: [
    UsersService,
    PaginationHeaderHelper,
    UsersVerifyService,
    UserAddressService,
  ],
  exports: [UsersService, UsersVerifyService, UserAddressService],
})
export class UsersModule {}
