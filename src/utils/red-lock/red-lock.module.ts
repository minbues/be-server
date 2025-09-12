import { Module } from '@nestjs/common';

import { RedLockService } from './red-lock.service';

@Module({
  exports: [RedLockService],
  providers: [RedLockService],
})
export class RedLockModule {}
