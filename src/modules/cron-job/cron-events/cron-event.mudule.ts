import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CronRedlockModule } from '../cron-redlock/cron-redlock.module';
import { EventsCronService } from './cron-event.service';
import { EventsModule } from '../../events/event.module';

@Module({
  imports: [ScheduleModule.forRoot(), CronRedlockModule, EventsModule],
  providers: [EventsCronService],
})
export class EventsCronModule {}
