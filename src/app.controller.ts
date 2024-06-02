import {
  Controller,
  Get,
  Body,
  Query,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { WordDto, VoteDto } from './app.model';
import { Response, Request, query } from 'express';
import { Turnstile, User } from './app.guard';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly config: ConfigService,
  ) {}
  @Get('/')
  respondOk() {
    return 'OK';
  }

  @Get('/profile')
  async getProfile(@Req() req) {
    return await this.appService.getProfile(req);
  }

  @Get('/nickname')
  getNickname(@Req() req: Request) {
    return req['nickname'] ?? 'No Name';
  }

  @Get('/validatenickname')
  async validatenickname(@Query('name') name) {
    return await this.appService.checkNickname(name);
  }

  /**
   * DB에 유저 등록
   */
  @UseGuards(User)
  @Post('/registerMember')
  async registerMember(
    @Body() body,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { name } = body;
    const a = await this.appService.setNickname(name, req, res);
    res.json(a);
  }

  @Get('/login')
  async auth(
    @Res() res: Response,
    @Query('code') code,
    @Query('error') error,
    @Query('error_description') error_description,
    @Query('state') state,
  ) {
    if (error !== undefined) {
      return 'error';
    }
    this.appService.loginUser(code, state, res);
  }

  @UseGuards(Turnstile, User)
  @Post('/create')
  async createWord(
    @Req() req: Request,
    @Res() res: Response,
    @Body() wordDto: WordDto,
  ) {
    const uri = await this.appService.createWord(wordDto, req);
    res.redirect(uri);
  }

  @Put('/vote')
  voteWord(@Body() voteDto: VoteDto, @Req() req) {
    voteDto.ip = req.header('CF-Connecting-IP') as string;
    return this.appService.voteWord(voteDto);
  }

  @Put('/removevote')
  removeVote(@Body() voteDto: VoteDto, @Req() req) {
    voteDto.ip = req.header('CF-Connecting-IP') as string;
    return this.appService.removeVote(voteDto);
  }

  @Get('/search')
  async getWords(
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Req() req,
  ) {
    console.log(keyword);
    console.log(page);
    const a = await this.appService.getWords(keyword, page, req);
    return a;
  }
}
