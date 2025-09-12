import fs from 'node:fs/promises';

import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';

import { config } from '../../config/app.config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const {
  host,
  port,
  user,
  password: pass,
  defaultEmail,
  defaultName,
} = config.mail;

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  constructor() {
    const smtpConfig: SMTPTransport.Options = {
      host: host,
      port: Number(port),
      secure: false,
      requireTLS: false,
      ignoreTLS: true,
      auth: {
        user,
        pass,
      },
    };
    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;
    if (templatePath) {
      const template = await fs.readFile(templatePath, 'utf-8');
      html = Handlebars.compile(template, { strict: true })(context);
    }

    await this.transporter.sendMail({
      ...mailOptions,
      from: mailOptions.from
        ? mailOptions.from
        : `${defaultName} <${defaultEmail}>`,
      html: mailOptions.html ? mailOptions.html : html,
    });
  }
}
