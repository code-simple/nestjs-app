import { EmailSenderType } from '../types/common';

export interface EmailSenderStrategy {
  type: EmailSenderType;
  sendEmail(
    to: string,
    subject: string,
    body: string,
    data: Record<string, any>,
  ): Promise<void>;
  sendRawEmail(
    to: string,
    subject: string,
    htmlContent: string,
    data?: Record<string, any>,
  ): Promise<void>;
}
