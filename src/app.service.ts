import { Injectable } from '@nestjs/common';
import { WordDto, VoteDto } from './app.model';
import { Repository } from './app.repository';

@Injectable()
export class AppService {
  constructor(private readonly repository: Repository) {}

  createWord(wordDto: WordDto): Promise<boolean> {
    return this.repository.createWord(wordDto);
  }

  voteWord(voteDto: VoteDto): Promise<boolean> {
    return this.repository.voteWord(voteDto);
  }

  removeVote(voteDto: VoteDto): Promise<boolean> {
    return this.repository.removeVote(voteDto);
  }

  getWords(keyword: string, page: number): Promise<boolean> {
    return this.repository.getWords(keyword, page);
  }
}
