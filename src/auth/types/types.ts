import { Request } from 'express';

export type GuardUserContext = {
  username: string;
  sub: { id: number; name: string };
  iat: number;
  exp: number;
};

export interface CustomRequest
  extends Request<unknown, any, any, unknown, Record<string, any>> {
  user?: GuardUserContext;
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
