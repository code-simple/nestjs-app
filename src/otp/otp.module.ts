import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './providers/otp.service';

@Module({
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
