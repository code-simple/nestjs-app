import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OtpService } from 'src/otp/providers/otp.service';
import { UsersOnboardingStepsService } from 'src/users-onboarding-steps/providers/users-onboarding-steps.service';
import { StepNames } from 'src/users-onboarding-steps/types/step.types';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly usersOnboardingStepsService: UsersOnboardingStepsService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8080/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails } = profile;
      const userEmail = emails[0].value;
      const userName = `${name.givenName} ${name.familyName}`;

      let user = await this.usersService.findOneByEmail(userEmail);

      const otpSecret = this.otpService.generateSecret();

      if (!user) {
        user = await this.usersService.create({
          email: userEmail,
          name: userName,
          profileImage: profile.photos[0]?.value || null,
          isEmailVerified: true,
          otpSecret,
        });

        /**
         * Onboarding step creation
         */
        await this.usersOnboardingStepsService.createOnboardingStep(
          user.id,
          StepNames.registration,
        );
        await this.usersOnboardingStepsService.createOnboardingStep(
          user.id,
          StepNames.email_verification,
        );
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
}
