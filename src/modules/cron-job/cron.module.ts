import { Module } from '@nestjs/common';
import { EventsCronModule } from './cron-events/cron-event.mudule';

@Module({
  imports: [EventsCronModule],
})
export class CronModule {}
