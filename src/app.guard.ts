import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { CustomJwt } from './app.jwt';
import { TokenExpiredError } from '@nestjs/jwt';
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
  ) {}
  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const token = this.parseToken(req);
    if (!token) throw new UnauthorizedException('invalid token');
    try {
      const payload = await this.jwt.verifyToken(token);
      req['user'] = payload;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
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
