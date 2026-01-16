import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from '../providers/auth.service';
import configuration from 'src/config/configuration';
import { TokenType } from '../types/types';

@Controller('auth/google')
export class GoogleAuthController {
  private readonly configuration = configuration();

  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const { user } = req;

      const payload = {
        username: user.email,
        sub: {
          id: user.id,
          name: user.name,
        },
      };

      const expiresIn = Math.floor(Date.now()) + this.configuration.jwt.access.expiry * 1000;

      const tokens = {
        user,
        authTokens: {
          accessToken: await this.authService.generateToken(payload, TokenType.ACCESS),
          refreshToken: await this.authService.generateToken(payload, TokenType.REFRESH),
          expiresIn,
        },
      };

      res.redirect(
        `http://localhost:3000/login/auth-callback?accessToken=${tokens.authTokens.accessToken}&refreshToken=${tokens.authTokens.refreshToken}&expiresIn=${tokens.authTokens.expiresIn}&userId=${user.id}`,
      );
    } catch (error) {
      console.error('Google auth error:', error);
      res.redirect('http://localhost:3000/login?error=authentication_failed');
    }
  }
}
