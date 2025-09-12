import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherUserEntity } from '../../entities/voucher-user.entity';
import { VoucherEntity } from '../../entities/voucher.entity';
import { VouchersController } from './voucher.controller';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { VouchersService } from './voucher.service';
import { UsersModule } from '../users/users.module';
import { VouchersPublicController } from './voucher.public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoucherEntity, VoucherUserEntity]),
    UsersModule,
  ],
  controllers: [VouchersController, VouchersPublicController],
  providers: [PaginationHeaderHelper, VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
