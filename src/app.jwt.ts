import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SHA256 } from 'crypto-js';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

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
      expiresIn: '1d',
      subject: this.config.get('THIS_DOMAIN'),
      audience: this.config.get('REDIRECT_URL'),
    };
    this.verifyOption = {
      secret: this.config.get('JWT_SECRET'),
    };
  }
  makeHash(id: string) {
    return SHA256(id + this.salt).toString();
  }
  async makeToken(id: string) {
    return this.signAsync({ id }, this.signOption);
  }

  async verifyToken(token: string) {
    return this.verifyAsync(token, this.verifyOption);
  }
}
