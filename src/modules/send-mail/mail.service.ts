import { Injectable } from '@nestjs/common';
import path from 'path';

import { config } from '../../config/app.config';
import { MailData } from './interfaces/mail-data.interface';
import { MailerService } from './mailer.service';

const { frontendUrl } = config.client;

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const url = new URL(frontendUrl + '/password-change');
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());
    const resetPasswordTitle = 'Reset password';
    await this.mailerService.sendMail({
      context: {
        actionTitle: resetPasswordTitle,
        text1: mailData.to.split('@')[0],
        title: resetPasswordTitle,
        url: url.toString(),
      },
      subject: resetPasswordTitle,
      templatePath: path.join(
        'src',
        'modules',
        'send-mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      text: `${url.toString()} ${resetPasswordTitle}`,
      to: mailData.to,
    });
  }

  async verifyAccount(
    mailData: MailData<{
      name: string;
      customer: string | number;
      codeExpires: Date;
      code: string;
    }>,
  ): Promise<void> {
    const url = new URL(frontendUrl + '/verify');
    url.searchParams.set('customer', String(mailData.data.customer));
    url.searchParams.set(
      'codeExpires',
      mailData.data.codeExpires.getTime().toString(),
    );
    const verifyAccountTitle = 'Verify Account';
    await this.mailerService.sendMail({
      context: {
        actionTitle: verifyAccountTitle,
        name: mailData.data.name,
        title: verifyAccountTitle,
        url: url.toString(),
        code: mailData.data.code,
      },
      subject: verifyAccountTitle,
      templatePath: path.join(
        'src',
        'modules',
        'send-mail',
        'mail-templates',
        'verify-account.hbs',
      ),
      text: `${url.toString()} ${verifyAccountTitle}`,
      to: mailData.to,
    });
  }
}
