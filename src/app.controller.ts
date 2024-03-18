import { Controller, Get, Body, Query, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { WordDto, VoteDto } from './app.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/create')
  createWord(@Body() wordDto: WordDto): string {
    return this.appService.createWord(wordDto);
  }

  @Put('/like')
  likeWord(@Body() voteDto: VoteDto): string {
    return this.appService.likeWord(voteDto);
  }

  @Put('/dislike')
  dislikeWord(@Body() voteDto: VoteDto): string {
    return this.appService.dislikeWord(voteDto);
  }

  @Put('/removelike')
  removeLike(@Body() voteDto: VoteDto): string {
    return this.appService.removeLike(voteDto);
  }

  @Put('/removedislike')
  removeDislike(@Body() voteDto: VoteDto): string {
    return this.appService.removeLike(voteDto);
  }

  @Get('/search')
  getWords(
    @Query('keyword') keyword: string,
    @Query('page') page: number,
  ): string {
    return this.appService.getWords(keyword, page);
  }
}
