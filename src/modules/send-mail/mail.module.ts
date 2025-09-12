import { Module } from '@nestjs/common';

import { MailerService } from './mailer.service';
import { MailService } from './mail.service';

@Module({
  exports: [MailService, MailerService],
  providers: [MailService, MailerService],
})
export class MailModule {}
