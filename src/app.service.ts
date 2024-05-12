import { Injectable } from '@nestjs/common';
import { WordDto, VoteDto } from './app.model';
import { Repository } from './app.repository';
import { CookieOptions, Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogIn } from './app.login';

@Injectable()
export class AppService {
  constructor(
    private readonly repository: Repository,
    private readonly httpservice: HttpService,
    private readonly config: ConfigService,
    private readonly login: LogIn,
  ) {}

  async checkNickname(name: string) {
    return await this.repository.checkNickname(name);
  }

  async registerMember(name: string, req: Request, res: Response) {
    console.log(req.cookies);

    const access_token: string = req.cookies['access_token'];
    console.log(access_token);
    const id = await this.login.getUserId(access_token);
    res.cookie('nickname', name);
    console.log(id);
    return await this.repository.registerMember(name, id);
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
    const token = await this.login.getAccessToken(code, state);
    console.log(token);
    console.log('get token complete');
    const id = await this.login.getUserId(token.access_token);
    console.log('get id complete');
    const isMember = await this.login.isMember(id);
    console.log('check member complete');
    const cookieOption: CookieOptions = {
      httpOnly: false,
    };
    const access_token_option: CookieOptions = {
      ...cookieOption,
      maxAge: token.expires_in * 1000,
    };
    const refresh_token_option: CookieOptions = {
      ...cookieOption,
      maxAge: token.refresh_token_expires_in * 1000,
    };
    if (isMember) {
      const nickname = this.login.getNickname(id);
      res.cookie('nickname', nickname, cookieOption);
      res.cookie('access_token', token.access_token, access_token_option);
      res.cookie('refresh_token', token.refresh_token, refresh_token_option);
      res.redirect(this.config.get('REDIRECT_URL'));
    } else {
      res.cookie('access_token', token.access_token, access_token_option);
      res.cookie('refresh_token', token.refresh_token, refresh_token_option);
      res.redirect(this.config.get('REDIRECT_URL') + '/nickname.html');
      console.log('redirect complete');
    }
  }
}
