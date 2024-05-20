import { Injectable } from '@nestjs/common';
import { WordDto, VoteDto, Cookie } from './app.model';
import { Repository } from './app.repository';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogIn } from './app.login';
import { CustomJwt } from './app.jwt';
import { CookieService } from './app.cookie';

@Injectable()
export class AppService {
  constructor(
    private readonly repository: Repository,
    private readonly httpservice: HttpService,
    private readonly config: ConfigService,
    private readonly login: LogIn,
    private readonly jwt: CustomJwt,
    private readonly coo: CookieService,
  ) {}

  async checkNickname(name: string) {
    return await this.repository.checkNickname(name);
  }

  async setNickname(name: string, req: Request, res: Response) {
    const id: string = req['id'];
    return await this.repository.setNickname(name, id);
  }

  async createWord(wordDto: WordDto) {
    return this.repository.createWord(wordDto);
  }

  async voteWord(voteDto: VoteDto) {
    return this.repository.voteWord(voteDto);
  }

  async removeVote(voteDto: VoteDto) {
    return this.repository.removeVote(voteDto);
  }

  async getWords(keyword: string, page: number, req: Request): Promise<string> {
    const ip = req.header('CF-Connecting-IP');
    return this.repository.getWords(keyword, page, ip);
  }

  async loginUser(code: string, state: string, res: Response) {
    const kakaoToken = await this.login.getToken(code, state);
    const id = await this.login.getUserId(kakaoToken.access_token);

    const hashedId = this.jwt.makeHash(id);

    const _accessToken = this.jwt.makeAccessToken(hashedId);
    const _refreshToken = this.jwt.makeRefreshToken(hashedId);

    const _isMember = this.login.isMember(hashedId);
    const accessToken = await _accessToken;
    const refreshToken = await _refreshToken;
    const isMember = await _isMember;

    res.setHeader('Authorization', accessToken);

    const refreshTokenCookie: Cookie = {
      name: 'refreshToken',
      val: refreshToken,
      options: {
        domain: this.config.get('THIS_URL'),
        maxAge: 1000 * 60 * 60 * 24 * 100 - 10,
        httpOnly: true,
        secure: true,
        signed: true,
      },
    };
    this.coo.setCookie(res, [refreshTokenCookie]);
    if (isMember) {
      res.redirect(this.config.get('REDIRECT_URL'));
    } else {
      this.login.registerMember(hashedId);
      res.redirect(this.config.get('REDIRECT_URL') + '/nickname.html');
    }
  }
}
