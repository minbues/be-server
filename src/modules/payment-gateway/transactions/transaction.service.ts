import { Injectable } from '@nestjs/common';
import { OrderEntity } from '../../../entities/orders.entity';
import {
  TransactionBankEntity,
  TransactionStatusEnum,
} from '../../../entities/transactions.entity';
import { BankTransaction } from '../../../modules/webhooks/interface/webhook.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionBankEntity)
    private readonly transactionRepository: Repository<TransactionBankEntity>,
  ) {}

  async createTransaction(
    dto: BankTransaction,
    orderId?: string,
    order?: OrderEntity,
  ) {
    const payload = {
      transactionId: String(dto.id),
      data: dto,
      orderId: orderId ?? undefined,
      order: order ?? undefined,
      status: TransactionStatusEnum.SUCCESS,
    };
    const transaction = this.transactionRepository.create(payload);

    return await this.transactionRepository.save(transaction);
  }
}
