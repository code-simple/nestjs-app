import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import configuration from 'src/config/configuration';
import { GuardUserContext } from '../types/types';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class AuthCheckGuard implements CanActivate {
  private readonly configuration = configuration();

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<{ req: Request }>().req;

    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configuration.jwt.access.secretKey,
      });

      const user = await this.usersService.findOne(payload.sub.id);
      if (!user) throw new UnauthorizedException();

      request['user'] = payload as GuardUserContext;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
