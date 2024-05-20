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
import { Observable } from 'rxjs';

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
  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const accessToken = this.parseToken(req);
    const refreshToken = this.coo.getCookie(req)['refreshToken'];
    if (!accessToken || !refreshToken)
      throw new UnauthorizedException('invalid token');
    try {
      const accessTokenBody =
        await this.jwt.verifyCustomTokenAsync(accessToken);
      req['id'] = accessTokenBody['id'];
      return true;
    } catch (error1) {
      if (error1 instanceof TokenExpiredError) {
        try {
          const refreshTokenBody =
            await this.jwt.verifyCustomTokenAsync(refreshToken);
          const hashed_id = refreshTokenBody['id'];
          const newAccessToken = await this.jwt.makeAccessToken(hashed_id);
          req['id'] = hashed_id;
          res.setHeader('Authorization', newAccessToken);
          return true;
        } catch (error2) {
          if (error2 instanceof TokenExpiredError) {
            throw new UnauthorizedException('Token expired');
          } else {
            throw new UnauthorizedException('Invalid Token');
          }
        }
      } else {
        throw new UnauthorizedException('Invalid Token');
      }
    }
  }

  parseToken(req: Request): string | false {
    const [type, token] = req.headers['authorization'].split(' ') ?? ['', ''];
    return type === 'Bearer' ? token : false;
  }
}

export { Turnstile, User };
