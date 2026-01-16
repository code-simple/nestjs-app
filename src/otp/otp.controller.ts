import { Controller } from '@nestjs/common';
import { OtpService } from './providers/otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}
}
