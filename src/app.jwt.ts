import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SHA256 } from 'crypto-js';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtToken } from './app.model';

@Injectable()
export class CustomJwt extends JwtService {
  private readonly signOption: JwtSignOptions;
  private readonly salt: string;
  private readonly verifyOption: JwtVerifyOptions;
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
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
    return this.verifyAsync(token, this.verifyOption);
  }
}
