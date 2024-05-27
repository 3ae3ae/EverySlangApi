import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SHA256 } from 'crypto-js';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtToken, Cookie } from './app.model';
import { Request, Response } from 'express';
import { CookieService } from './app.cookie';
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class CustomJwt extends JwtService {
  private readonly signOption: JwtSignOptions;
  private readonly salt: string;
  private readonly verifyOption: JwtVerifyOptions;
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    private readonly coo: CookieService,
  ) {
    super();
    this.salt = this.config.get('HASH_SALT');
    this.signOption = {
      secret: this.config.get('JWT_SECRET'),
      subject: this.config.get('THIS_URL'),
      audience: this.config.get('REDIRECT_URL'),
    };
    this.verifyOption = {
      secret: this.config.get('JWT_SECRET'),
    };
  }
  makeHash(id: string) {
    return SHA256(id + this.salt).toString();
  }
  async makeAccessToken(id: string) {
    return this.signAsync({ id }, { ...this.signOption, expiresIn: '1h' });
  }
  async makeRefreshToken(id: string) {
    return this.signAsync({ id }, { ...this.signOption, expiresIn: '100d' });
  }

  async verifyCustomTokenAsync(token: string): Promise<JwtToken> {
    return await this.verifyAsync(token, this.verifyOption);
  }

  async injectID(req: Request, res: Response) {
    const accessToken = this.coo.getCookie(req)['accessToken'];
    const refreshToken = this.coo.getCookie(req)['refreshToken'];
    const nickname = this.coo.getCookie(req)['nickname'];
    const c = this.coo.getCookie(req);
    if (!refreshToken) return false;
    try {
      const accessTokenBody = await this.verifyCustomTokenAsync(accessToken);
      req['nickname'] = nickname;
      req['id'] = accessTokenBody['id'];
      return true;
    } catch (error1) {
      if (error1 instanceof TokenExpiredError) {
        try {
          const refreshTokenBody =
            await this.verifyCustomTokenAsync(refreshToken);
          const hashed_id = refreshTokenBody['id'];
          const newAccessToken = await this.makeAccessToken(hashed_id);
          const newAccessTokenCookie: Cookie = {
            name: 'accessToken',
            val: newAccessToken,
            options: {
              domain: this.config.get('COOKIE_DOMAIN'),
              maxAge: 1000 * 60 * 60 * 1 - 10,
              httpOnly: true,
              signed: true,
            },
          };
          req['nickname'] = nickname;
          req['id'] = hashed_id;
          this.coo.setCookie(res, [newAccessTokenCookie]);
          return true;
        } catch (error2) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
}
