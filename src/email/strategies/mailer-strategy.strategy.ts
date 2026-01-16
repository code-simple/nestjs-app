import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailSenderStrategy } from '../abstracts/email-sender-strategy.interface';
import { EmailSenderType } from '../types/common';

@Injectable()
export class MailerStrategy implements EmailSenderStrategy {
  type = EmailSenderType.mailer;

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>,
  ): Promise<void> {
    await this.mailerService
      .sendMail({
        to,
        subject,
        template: `${template}.hbs`,
        context: data,
      })
      .then((res) => console.log('Template email sent:', res.accepted))
      .catch((err) => console.error('Template email failed:', err));
  }

  async sendRawEmail(
    to: string,
    subject: string,
    htmlContent: string,
    data: Record<string, any> = {},
  ): Promise<void> {
    const finalHtml = this.replacePlaceholders(htmlContent, data);

    await this.mailerService
      .sendMail({
        to,
        subject,
        html: finalHtml,
      })
      .then((res) => console.log('Raw HTML email sent:', res.accepted))
      .catch((err) => console.error('Raw HTML email failed:', err));
  }

  private replacePlaceholders(template: string, data: Record<string, any>): string {
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      return this.getValueFromPath(data, key) ?? '';
    });
  }

  private getValueFromPath(data: Record<string, any>, path: string): string | undefined {
    return path.split('.').reduce((acc, key) => acc?.[key], data);
  }
}
