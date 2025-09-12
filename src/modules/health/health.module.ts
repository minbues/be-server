import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule, TypeOrmModule],
  providers: [HealthService],
})
export class HealthModule {}
