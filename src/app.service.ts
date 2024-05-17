import { Injectable } from '@nestjs/common';
import { WordDto, VoteDto } from './app.model';
import { Repository } from './app.repository';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogIn } from './app.login';
import { CustomJwt } from './app.jwt';

@Injectable()
export class AppService {
  constructor(
    private readonly repository: Repository,
    private readonly httpservice: HttpService,
    private readonly config: ConfigService,
    private readonly login: LogIn,
    private readonly jwt: CustomJwt,
  ) {}

  async checkNickname(name: string) {
    return await this.repository.checkNickname(name);
  }

  async setNickname(name: string, req: Request, res: Response) {
    const id: string = req['user']['id'];
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
    const _token = this.jwt.makeToken(hashedId);
    const _isMember = this.login.isMember(hashedId);
    const token = await _token;
    const isMember = await _isMember;
    res.header('Authorization', token);
    if (isMember) {
      res.redirect(this.config.get('REDIRECT_URL'));
    } else {
      this.login.registerMember(kakaoToken, hashedId);
      res.redirect(this.config.get('REDIRECT_URL') + '/nickname.html');
    }
  }
}
