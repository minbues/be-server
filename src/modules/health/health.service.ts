import { Injectable } from '@nestjs/common';
import {
  HealthCheckResult,
  HealthCheckService,
  HealthIndicator,
  HealthIndicatorFunction,
  HealthIndicatorResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { EHealthService } from './health.enum';

@Injectable()
export class HealthService extends HealthIndicator {
  constructor(
    private health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {
    super();
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return await this.health.check(this.pingCheck());
  }

  pingCheck(): HealthIndicatorFunction[] {
    return [() => this.isServiceHealthy(EHealthService.POSTGRES)];
  }

  async isServiceHealthy(key: EHealthService): Promise<HealthIndicatorResult> {
    try {
      switch (key) {
        case EHealthService.POSTGRES:
          await this.db.pingCheck(EHealthService.POSTGRES, { timeout: 3000 });
          break;
      }
      return this.getStatus(key, true);
    } catch (err) {
      return this.getStatus(key, false, err);
    }
  }
}
