import {
  Controller,
  Get,
  Body,
  Query,
  Post,
  Put,
  Header,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { WordDto, VoteDto } from './app.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/create')
  createWord(@Body() wordDto: WordDto) {
    return this.appService.createWord(wordDto);
  }

  @Put('/vote')
  voteWord(@Body() voteDto: VoteDto) {
    return this.appService.voteWord(voteDto);
  }

  @Put('/removevote')
  removeVote(@Body() voteDto: VoteDto) {
    return this.appService.removeVote(voteDto);
  }

  @Header('Access-Control-Allow-Origin', '*')
  @Get('/search')
  getWords(
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Req() req,
  ) {
    return this.appService.getWords(keyword, page, req);
  }
}
