import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { MailModule } from './send-mail/mail.module';
import { SeedModule } from '../database/seeds/seed.module';
import { UsersModule } from './users/users.module';
import { MasterDataModule } from './master-data/master-data.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';
import { HealthModule } from './health/health.module';
import { VouchersModule } from './voucher/voucher.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { OrdersModule } from './orders/orders.module';
import { WssModule } from './wss/wss.module';
import { WebhookMudule } from './webhooks/webhook.module';
import { ChatModule } from './chat/chat.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/event.module';
import { CronModule } from './cron-job/cron.module';

@Module({
  imports: [
    AuthModule,
    SessionModule,
    MailModule,
    SeedModule,
    UsersModule,
    MasterDataModule,
    ProductsModule,
    CartsModule,
    HealthModule,
    VouchersModule,
    PaymentGatewayModule,
    OrdersModule,
    WssModule,
    WebhookMudule,
    ChatModule,
    AnalyticsModule,
    NewsModule,
    EventsModule,
    CronModule,
  ],
})
export class ApiModule {}
