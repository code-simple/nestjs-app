import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { OtpService } from 'src/otp/providers/otp.service';
import { UsersOnboardingStepsService } from 'src/users-onboarding-steps/providers/users-onboarding-steps.service';
import { StepNames } from 'src/users-onboarding-steps/types/step.types';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly usersOnboardingStepsService: UsersOnboardingStepsService,
  ) {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:8080/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      const userEmail = emails && emails[0] ? emails[0].value : null;

      if (!userEmail) {
        return done(new Error('Email not provided by Facebook'), null);
      }

      const userName = `${name.givenName} ${name.familyName}`;

      let user = await this.usersService.findOneByEmail(userEmail);

      const otpSecret = this.otpService.generateSecret();

      if (!user) {
        user = await this.usersService.create({
          email: userEmail,
          name: userName,
          profileImage: photos && photos[0] ? photos[0].value : null,
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
