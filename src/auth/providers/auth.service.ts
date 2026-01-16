/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/providers/users.service';
import { LoginInputDto } from '../dtos/login-input.dto';
import configuration from 'src/config/configuration';
import { RefreshTokenResponseDto } from '../dtos/refresh-token-response.dto';
import messages from 'src/utils/messages';
import { TokenType } from '../types/types';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  private readonly configuration = configuration();

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginInputDto) {
    const user = await this.validateUser(dto);
    const payload = {
      username: user.email,
      sub: {
        id: user.id,
        name: user.name,
      },
    };

    const expiresIn = Math.floor(Date.now()) + this.configuration.jwt.access.expiry * 1000;

    return {
      user,
      authTokens: {
        accessToken: await this.generateToken(payload, TokenType.ACCESS),
        refreshToken: await this.generateToken(payload, TokenType.REFRESH),
        expiresIn,
      },
    };
  }

  async validateUser(dto: LoginInputDto) {
    const user = await this.userService.findOneByEmailWithRelations(dto.email, []);

    if (!user.password) {
      throw new Error('Please register with your email!');
    }

    if (user && (await compare(dto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new BadRequestException(messages.INVALID_CREDENTIALS);
  }

  async refreshToken(user: any): Promise<RefreshTokenResponseDto> {
    const payload = {
      username: user.username,
      sub: user.sub,
    };

    return {
      accessToken: await this.generateToken(payload, TokenType.ACCESS),
      refreshToken: await this.generateToken(payload, TokenType.REFRESH),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  async verifyEmail(userId: number): Promise<void> {
    await this.userService.update(userId, { isEmailVerified: true });
  }

  async generateToken(payload: Record<string, any>, tokenType: TokenType): Promise<string> {
    const expiry =
      tokenType === TokenType.ACCESS
        ? this.configuration.jwt.access.expiry
        : this.configuration.jwt.refresh.expiry;

    const secretKey =
      tokenType === TokenType.ACCESS
        ? this.configuration.jwt.access.secretKey
        : this.configuration.jwt.refresh.secretKey;

    return this.jwtService.signAsync(payload, {
      expiresIn: expiry,
      secret: secretKey,
    });
  }
}
