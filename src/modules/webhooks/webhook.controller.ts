import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BankTransaction } from './interface/webhook.interface';
import { decodeOrderCode } from '../../utils/helpers/common.helper';
import { OrdersService } from '../orders/orders.service';
import { TransactionsService } from '../payment-gateway/transactions/transaction.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ApiOperation({
    description: 'receive Transaction Banking',
    operationId: 'receiveTransactionBanking',
  })
  async handleTransactionPayment(@Body() data: BankTransaction) {
    console.log('handleTransactionPayment', data);
    if (typeof data !== 'object') {
      Logger.log('Webhook banking return no data');
    }

    const transaction = await this.transactionsService.createTransaction(data);

    const { userId, createdAt, code } = decodeOrderCode(data.content);
    if (userId && createdAt && code) {
      await this.ordersService.handlePaymentOrder(
        userId,
        code,
        transaction.id,
        transaction,
      );
      return { status: 'success', message: 'Payment handled' };
    } else {
      Logger.warn(
        'Decoded content missing required fields',
        JSON.stringify(data),
      );
    }
  }
}
