import { Module } from '@nestjs/common';

import { SessionService } from './session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from '../../entities/sessions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
