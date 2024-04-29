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
import { Response } from 'express';
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

  // @Header('Access-Control-Allow-Origin', '*')
  @UseGuards(Turnstile)
  @Post('/create')
  async createWord(@Res() res: Response, @Body() wordDto: WordDto) {
    const uri = await this.appService.createWord(wordDto);
    res.redirect(this.config.get('REDIRECT_URL'));
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
  getWords(
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Req() req,
  ) {
    return this.appService.getWords(keyword, page, req);
  }
}
