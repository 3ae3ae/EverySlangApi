import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class Turnstile implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.body['cf-turnstile-response'];
    const ip = req.headers['CF-Connecting-IP'] as string;
    const form = new FormData();
    form.append('response', token);
    form.append('Remoteip', ip);
    form.append('secret', process.env.SECRET_KEY);
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { body: form, method: 'POST' },
    );
    const result = await res.json();
    if (result.success) return true;
    else return false;
  }
}
