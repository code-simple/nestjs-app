import { Inject, Injectable } from '@nestjs/common';
import { MailerIdentifiers } from '../types/email-sender.types';
import { emailMessages } from 'src/utils/messages';
import { MailerStrategy } from '../strategies/mailer-strategy.strategy';
import { EmailSenderStrategy } from '../abstracts/email-sender-strategy.interface';
import { EmailSenderType } from '../types/common';
import { StrategyTypes } from 'src/common/types/global';

@Injectable()
export class EmailSenderService {
  private emailerSenderStrategies: { [key: string]: EmailSenderStrategy };
  private defaultStrategy: EmailSenderStrategy;

  constructor(
    @Inject(StrategyTypes.EMAIL_STRATEGIES)
    mailerStrategies: MailerStrategy[],
  ) {
    this.emailerSenderStrategies = mailerStrategies.reduce((acc, strategy) => {
      acc[strategy.type] = strategy;
      return acc;
    }, {});

    this.defaultStrategy = this.emailerSenderStrategies[EmailSenderType.mailer];
  }

  async sendUserRegistrationEmail(to: string, username: string, otp: string): Promise<void> {
    const subject = emailMessages.userRegistration.welcomeText;
    const template = MailerIdentifiers.USER_REGISTRATION;
    const data = { username, otp };

    await this.defaultStrategy.sendEmail(to, subject, template, data);
  }

  async sendForgotPasswordEmail(to: string, username: string, otp: string): Promise<void> {
    const subject = emailMessages.forgotPassword.subject;
    const template = MailerIdentifiers.FORGOT_PASSWORD;
    const data = { username, otp };

    await this.defaultStrategy.sendEmail(to, subject, template, data);
  }

  // send email to user when they are invited to a tournament
  // async sendTournamentInvitationEmail(
  //   to: string,
  //   username: string,
  //   tournamentName: string,
  //   tournamentDate: string,
  //   invitationLink: string,
  // ): Promise<void> {
  //   const subject = emailMessages.tournamentInvitation.subject;
  //   const template = MailerIdentifiers.TOURNAMENT_INVITATION;
  //   const data = { username, tournamentName, tournamentDate, invitationLink };

  //   await this.defaultStrategy.sendEmail(to, subject, template, data);
  // }

  // async sendTournamentReminderEmail(
  //   to: string,
  //   subject: string,
  //   htmlContent: string,
  //   data: Record<any, any>,
  // ): Promise<void> {
  //   await this.defaultStrategy.sendRawEmail(to, subject, htmlContent, data);
  // }
}
