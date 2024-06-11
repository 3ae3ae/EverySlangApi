import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie } from './app.model';

@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService) {}

  setCookie(res: Response, items: Cookie[]) {
    for (const item of items) {
      const { name, val, options } = item;
      res.cookie(name, val, options);
    }
  }
  getCookie(req: Request) {
    return { ...req.cookies, ...req.signedCookies };
  }

  clearAllCookies(res: Response) {
    const c = ['nickname', 'refreshToken', 'accessToken'].map((c) => ({
      name: c,
      val: '',
      options: {
        domain: this.config.get('COOKIE_DOMAIN'),
        maxAge: 1,
        httpOnly: true,
        signed: true,
      },
    }));
    this.setCookie(res, c);
  }
}
