import { NestMiddleware, Injectable } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import { CustomJwt } from './app.jwt';
import { CookieService } from './app.cookie';

@Injectable()
export class InjectIDMiddleware implements NestMiddleware {
  constructor(private readonly jwt: CustomJwt) {}
  async use(req: Request, res: Response, next: NextFunction) {
    await this.jwt.injectID(req, res);
    next();
  }
}
