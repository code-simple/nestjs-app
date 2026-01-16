import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/providers/users.service';
import { LoginInputDto } from './dtos/login-input.dto';
import { AuthService } from './providers/auth.service';
import { RegisterInputDto } from './dtos/register-input.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { RefreshTokenResponseDto } from './dtos/refresh-token-response.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { MessageResponseDto } from '../common/dtos/message-response.dto';
import messages from 'src/utils/messages';
import { EmailSenderService } from 'src/email/providers/email-sender.service';
import { OtpService } from 'src/otp/providers/otp.service';
import { AuthCheckGuard } from './guards/auth-check.guard';
import { VerifyEmailInputDto } from './dtos/verify-email-input.dto';
import { JwtService } from '@nestjs/jwt';
import { CustomRequest, TokenType } from './types/types';
import { OtpVerifyResponseDto } from 'src/common/dtos/otp-verify-response.dto';
import { authDocs } from 'src/api-documentation/auth.apiDoc';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly emailSenderService: EmailSenderService,
    private readonly otpService: OtpService,
    private jwtService: JwtService,
  ) {}

  @Mutation(() => MessageResponseDto, {
    description: authDocs.mutation.register.description,
  })
  async register(@Args('input') registerInput: RegisterInputDto) {
    try {
      const user = await this.usersService.findOneByEmail(registerInput.email);
      const otpSecret = this.otpService.generateSecret();
      let createdUser;

      if (user && !user.isGhostUser) {
        throw new ConflictException(messages.USER_ALREADY_EXISTS);
      }

      if (user && user.isGhostUser) {
        const hashedPassword = await bcrypt.hash(registerInput.password, 10);
        await this.usersService.update(user.id, {
          ...registerInput,
          password: hashedPassword,
          isGhostUser: false,
          otpSecret,
        });
        createdUser = await this.usersService.findOne(user.id);
      } else {
        createdUser = await this.usersService.create({
          ...registerInput,
          otpSecret,
        });
      }

      const emailVerificationOtp = this.otpService.generateOtp(otpSecret);
      await this.emailSenderService.sendUserRegistrationEmail(
        createdUser.email,
        createdUser.name,
        emailVerificationOtp,
      );

      return { message: messages.VERIFY_YOUR_EMAIL };
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @Mutation(() => LoginResponseDto)
  async login(@Args('input') loginInput: LoginInputDto) {
    try {
      return await this.authService.login(loginInput);
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @UseGuards(RefreshJwtGuard)
  @Mutation(() => RefreshTokenResponseDto)
  async refreshToken(@Context('req') req) {
    try {
      return await this.authService.refreshToken(req.user);
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @UseGuards(AuthCheckGuard)
  @Mutation(() => MessageResponseDto)
  async verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInputDto) {
    try {
      const user = await this.usersService.findOneByEmail(verifyEmailInput.email);
      if (!user) {
        throw new NotFoundException(messages.USER_NOT_FOUND);
      }

      const isOTPValid = this.otpService.validateOtp(verifyEmailInput.otp, user.otpSecret);
      if (!isOTPValid) {
        /**
         * OTP is expired
         * Sending new email verification otp
         */
        const emailVerificationOtp = this.otpService.generateOtp(user.otpSecret);
        await this.emailSenderService.sendUserRegistrationEmail(
          user.email,
          user.name,
          emailVerificationOtp,
        );

        throw new NotFoundException(messages.EMAIL_VERIFICATION_OTP_EXPIRED);
      }

      await this.authService.verifyEmail(user.id);

      /**
       * Onboarding step creation
       */

      return { message: messages.EMAIL_VERIFICATION_SUCCESSFULL };
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @Mutation(() => MessageResponseDto)
  async sendForgotPasswordEmail(@Args('email') email: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException(messages.USER_NOT_FOUND);
      }

      const otp = this.otpService.generateOtp(user.otpSecret);
      await this.emailSenderService.sendForgotPasswordEmail(user.email, user.name, otp);

      return { message: messages.FORGOT_PASSWORD_EMAIL_SENT };
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @Mutation(() => OtpVerifyResponseDto)
  async verifyOtp(
    @Args('email') email: string,
    @Args('otp') otp: string,
  ): Promise<OtpVerifyResponseDto> {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException(messages.USER_NOT_FOUND);
      }

      const isOTPValid = this.otpService.validateOtp(otp, user.otpSecret);
      if (!isOTPValid) {
        /**
         * OTP is expired
         * Sending new verification otp
         */
        const verificationOtp = this.otpService.generateOtp(user.otpSecret);
        await this.emailSenderService.sendForgotPasswordEmail(
          user.email,
          user.name,
          verificationOtp,
        );

        throw new NotFoundException(messages.VERIFICATION_OTP_EXPIRED);
      }

      const token = await this.authService.generateToken(
        {
          username: user.email,
          sub: {
            id: user.id,
            name: user.name,
          },
        },
        TokenType.ACCESS,
      );

      return { message: messages.OTP_VERIFIED_SUCCESSFULLY, token };
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @UseGuards(AuthCheckGuard)
  @Mutation(() => MessageResponseDto)
  async resetPassword(
    @Context('req') req: CustomRequest,
    @Args('newPassword') newPassword: string,
  ): Promise<MessageResponseDto> {
    try {
      const userId = req.user.sub.id;
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException(messages.USER_NOT_FOUND);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.update(user.id, { password: hashedPassword });

      return { message: messages.PASSWORD_RESET_SUCCESSFULLY };
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }
}
