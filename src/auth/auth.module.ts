import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from 'src/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { OtpModule } from 'src/otp/otp.module';
import { GoogleStrategy } from './strategies/google-login-strategy.strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { FacebookAuthController } from './controllers/facebook-auth.controller';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => EmailModule),
    OtpModule,
    PassportModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtService,
    GoogleStrategy,
    // FacebookStrategy
  ],

  controllers: [GoogleAuthController, FacebookAuthController],
})
export class AuthModule {}
