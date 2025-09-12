import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CronRedlockService } from '../cron-redlock/cron-redlock.service';
import { EventsService } from '../../events/event.service';
import { CacheModuleHelper } from '../../../utils/redis-cache/utils/cache-module-helper.util';

@Injectable()
export class EventsCronService {
  private readonly logger = new Logger(EventsCronService.name);
  constructor(
    private readonly eventsService: EventsService,
    private readonly cronRedlockService: CronRedlockService,
  ) {}
  onModuleInit() {
    this.getEventSchedule();
  }
  @Cron(CronExpression.EVERY_MINUTE, { name: 'getEventSchedule' })
  async getEventSchedule() {
    const lockKey = CacheModuleHelper.makeRedLockCacheKeyCommon(
      'EventsCronService-getEventSchedule',
    );
    await this.cronRedlockService.runWithLock(lockKey, async () => {
      await this.eventsService.getEventSchedule();
      this.logger.log('Cron EventsCronService-getEventSchedule');
    });
  }
}
