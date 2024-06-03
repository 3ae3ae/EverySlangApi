import { NestMiddleware, Injectable } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import { CustomJwt } from './app.jwt';
import { CookieService } from './app.cookie';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const r = req.body;
    for (const e of Object.entries(r)) {
      // console.log(e[0], ':', e[1]);
    }
    next();
  }
}

@Injectable()
export class InjectIDMiddleware implements NestMiddleware {
  constructor(private readonly jwt: CustomJwt) {}
  async use(req: Request, res: Response, next: NextFunction) {
    await this.jwt.injectID(req, res);
    next();
  }
}
