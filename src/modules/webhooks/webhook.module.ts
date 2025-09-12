import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  controllers: [WebhookController],
  imports: [PaymentGatewayModule, OrdersModule],
})
export class WebhookMudule {}
