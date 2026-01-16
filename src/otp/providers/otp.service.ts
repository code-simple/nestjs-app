import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Injectable()
export class OtpService {
  generateOtp(secret: string, step: number = 60): string {
    const otp = speakeasy.totp({
      secret,
      encoding: 'base32',
      step,
      digits: 6,
    });
    return otp;
  }

  validateOtp(otp: string, secret: string, step: number = 60): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: otp,
      step,
      window: 1,
    });
  }

  generateSecret(length: number = 20): string {
    return speakeasy.generateSecret({ length }).base32;
  }
}
