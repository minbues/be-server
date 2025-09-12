import { Injectable, Logger } from '@nestjs/common';
import { RedLockService } from '../../../utils/red-lock/red-lock.service';

@Injectable()
export class CronRedlockService {
  private readonly logging = new Logger(CronRedlockService.name);
  constructor(private readonly redLockService: RedLockService) {}

  async runWithLock(lockKey: string, task: () => Promise<void>) {
    let lock: any;
    try {
      lock = await this.redLockService.lock(lockKey, 5 * 60 * 1000);
      await task();
    } catch (err) {
      // logging.error(
      //   `Task with lock ${lockKey} failed or is already running on another instance.`,
      // );
      throw err;
    } finally {
      if (lock) {
        try {
          await this.redLockService.unlock(lock);
        } catch (unlockErr) {
          this.logging.error(
            `Failed to unlock lock ${lockKey}. Error: ${unlockErr.message}`,
          );
        }
      }
    }
  }
}
