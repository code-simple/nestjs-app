import { forwardRef, Module } from '@nestjs/common';
import * as path from 'path';
import { EmailSenderService } from './providers/email-sender.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerStrategy } from './strategies/mailer-strategy.strategy';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { OtpModule } from 'src/otp/otp.module';
import { StrategyTypes } from 'src/common/types/global';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('SMTP_HOST');
        const port = parseInt(configService.getOrThrow<string>('SMTP_PORT'), 10);
        const user = configService.get<string>('SMTP_USERNAME');
        const pass = configService.get<string>('SMTP_PASSWORD');
        const from = configService.getOrThrow<string>('DEFAULT_EMAIL_FROM');

        const transport: any = {
          host,
          port,
        };

        if (user && pass) {
          transport.auth = {
            user,
            pass,
          };
        }

        return {
          transport,
          defaults: {
            from: `"The Bracket Boss" <${from}>`,
          },
          template: {
            dir: path.resolve('src/email/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    forwardRef(() => AuthModule),
    OtpModule,
  ],
  providers: [
    MailerStrategy,
    JwtService,
    {
      provide: StrategyTypes.EMAIL_STRATEGIES,
      useFactory: (mailerStrategy: MailerStrategy) => [mailerStrategy],
      inject: [MailerStrategy],
    },
    EmailSenderService,
  ],
  exports: [EmailSenderService],
})
export class EmailModule {}
