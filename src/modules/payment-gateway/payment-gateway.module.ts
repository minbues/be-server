import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { VietQRController } from './vietqr/vietqr.controller';
import { VietQRService } from './vietqr/vietqr.service';
import { BankService } from './bank/bank.service';
import { BankController } from './bank/bank.controller';
import { BankEntity } from '../../entities/banks.entity';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { TransactionsService } from './transactions/transaction.service';
import { TransactionBankEntity } from '../../entities/transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankEntity, TransactionBankEntity]),
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
  ],
  controllers: [VietQRController, BankController],
  exports: [VietQRService, BankService, TransactionsService],
  providers: [
    VietQRService,
    BankService,
    TransactionsService,
    PaginationHeaderHelper,
  ],
})
export class PaymentGatewayModule {}
