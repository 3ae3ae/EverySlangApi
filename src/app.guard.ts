import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CustomJwt } from './app.jwt';
import { TokenExpiredError } from '@nestjs/jwt';
import { CookieService } from './app.cookie';
import { Cookie } from './app.model';

@Injectable()
class Turnstile implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();

    const token = req.body['cf-turnstile-response'];
    const ip = req.headers['CF-Connecting-IP'] as string;
    const form = new FormData();
    form.append('response', token);
    form.append('Remoteip', ip);
    form.append('secret', this.config.get('SECRET_KEY'));
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { body: form, method: 'POST' },
    );
    const result = await res.json();
    if (result.success) return true;
    else return false;
  }
}

@Injectable()
class User implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: CustomJwt,
    private readonly coo: CookieService,
  ) {}
  canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    if (!req['id']) {
      res.redirect(this.config.get('REDIRECT_URL') + '/needlogin.html');
      return false;
    }
    return true;
  }
}

export { Turnstile, User };
