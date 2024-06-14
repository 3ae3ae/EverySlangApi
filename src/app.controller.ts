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
  Param,
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

  @Get('/disableaccount')
  async disableAccount(@Req() req: Request, @Res() res: Response) {
    res.send(await this.appService.disableAccount(req, res));
  }

  @Get('/profile/:nickname')
  async getProfile(@Req() req, @Res() res, @Param('nickname') nickname) {
    if (!nickname) res.redirect('/profile/' + req['nickname']);
    else res.json(await this.appService.getProfile(nickname));
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
    if (error !== undefined || !code) {
      return 'error';
    }
    this.appService.loginUser(code, state, res);
  }

  @Get('/logout')
  async logout(
    @Res() res: Response,
    @Query('code') code,
    @Query('error') error,
    @Query('error_description') error_description,
    @Query('state') state,
  ) {
    if (error !== undefined || !code) {
      return 'error';
    }
    await this.appService.logoutUser(code, state, res);
    res.redirect(this.config.get('REDIRECT_URL'));
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
    const a = await this.appService.getWords(keyword, page, req);
    return a;
  }

  @UseGuards(User)
  @Get('/removeword/:id')
  async removeWord(@Param('id') word_id, @Req() req) {
    return (await this.appService.removeWord(Number(word_id), req))
      ? 'OK'
      : 'FAIL';
  }
}
