import { ApiProperty } from '@nestjs/swagger';
import { HealthCheckStatus } from '@nestjs/terminus';

export class HealthCheckResponse {
  @ApiProperty()
  status: HealthCheckStatus;
}
