import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { KakaoToken } from './app.model';
import { Repository } from './app.repository';

@Injectable()
export class LogIn {
  constructor(
    private readonly config: ConfigService,
    private readonly httpservice: HttpService,
    private readonly repository: Repository,
  ) {}

  async registerMember(id: string) {
    this.repository.registerMember(id);
  }

  async getToken(
    code: string,
    state: string,
    login: string,
  ): Promise<KakaoToken> {
    const data = {
      grant_type: 'authorization_code',
      client_id: this.config.get('KAKAO_APP_KEY'),
      redirect_uri: this.config.get('THIS_URL') + `/${login}`,
      code: code,
      client_secret: this.config.get('KAKAO_CLIENT_SECRET'),
    };
    const url = 'https://kauth.kakao.com/oauth/token';
    const _config = {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    };
    const source = this.httpservice.post(url, data, _config);
    const response = await lastValueFrom(source);
    return response.data;
  }

  async getUserId(ACCESS_TOKEN: string): Promise<string> {
    const url = 'https://kapi.kakao.com/v1/user/access_token_info';
    const response = await lastValueFrom(
      this.httpservice.get(url, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }),
    );
    if (response.status === 200) {
      return response.data['id'];
    } else return '';
  }

  async isMember(id: string) {
    return await this.repository.isMember(id);
  }

  async getNickname(id: string) {
    return await this.repository.getNickname(id);
  }

  async isDisabled(id: string) {
    return await this.repository.isDisabled(id);
  }
}
