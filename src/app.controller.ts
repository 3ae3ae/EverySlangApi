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
import { WordDto, VoteDto, Token } from './app.model';
import { Response, Request, query } from 'express';
import { Turnstile } from './app.guard';
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

  @Post('/registerMember')
  async registerMember(
    @Body() body,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { name } = body;
    console.log(req.cookies);
    console.log(req.cookies['access_token']);
    return await this.appService.registerMember(name, req, res);
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

  // @Header('Access-Control-Allow-Origin', '*')
  @UseGuards(Turnstile)
  @Post('/create')
  async createWord(@Res() res: Response, @Body() wordDto: WordDto) {
    const uri = await this.appService.createWord(wordDto);
    res.redirect(uri);
  }

  // @Header('Access-Control-Allow-Origin', '*')
  @Put('/vote')
  voteWord(@Body() voteDto: VoteDto, @Req() req) {
    voteDto.ip = req.header('CF-Connecting-IP') as string;
    return this.appService.voteWord(voteDto);
  }

  // @Header('Access-Control-Allow-Origin', '*')
  @Put('/removevote')
  removeVote(@Body() voteDto: VoteDto, @Req() req) {
    voteDto.ip = req.header('CF-Connecting-IP') as string;
    return this.appService.removeVote(voteDto);
  }

  // @Header('Access-Control-Allow-Origin', '*')
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
