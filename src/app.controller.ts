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

  @Get('/validatenickname')
  async validatenickname(@Query('name') name) {
    return await this.appService.checkNickname(name);
  }

  /**
   * DB에 유저 등록
   */
  @UseGuards(User)
  @Post('/registerMember')
  async registerMember(@Body() body, @Req() req: Request) {
    const { name } = body;
    const a = await this.appService.setNickname(name, req);
    console.log(a);
    return a;
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
      console.log('it is error');
      console.log(error, ' ', error_description);
      return 'error';
    }
    console.log('pass error test');
    this.appService.loginUser(code, state, res);
  }

  @UseGuards(Turnstile)
  @Post('/create')
  async createWord(@Res() res: Response, @Body() wordDto: WordDto) {
    const uri = await this.appService.createWord(wordDto);
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
    const a = await this.appService.getWords(keyword, page, req);
    console.log(a);
    return a;
  }
}
