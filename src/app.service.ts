import { Injectable, Inject } from '@nestjs/common';
import databaseConfig from './config/database.config';
import { ConfigType } from '@nestjs/config';
import { WordDto, VoteDto } from './app.model';
import { repository } from './app.repository';

@Injectable()
export class AppService {
  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: ConfigType<typeof databaseConfig>,
    private readonly repository,
  ) {}

  createWord(wordDto: WordDto): string {
    return this.repository.createWord(wordDto);
  }

  likeWord(voteDto: VoteDto): string {
    return this.repository.likeWord(voteDto);
  }

  dislikeWord(voteDto: VoteDto): string {
    return this.appService.getHello();
  }

  removeLike(voteDto: VoteDto): string {
    return this.appService.getHello();
  }

  removeDislike(voteDto: VoteDto): string {
    return this.appService.getHello();
  }

  getWords(keyword: string, page: number): string {
    return this.appService.getHello();
  }
}
