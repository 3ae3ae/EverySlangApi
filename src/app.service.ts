import { Injectable } from '@nestjs/common';
import { WordDto, VoteDto } from './app.model';
import { Repository } from './app.repository';

@Injectable()
export class AppService {
  constructor(private readonly repository: Repository) {}

  createWord(wordDto: WordDto) {
    return this.repository.createWord(wordDto);
  }

  voteWord(voteDto: VoteDto) {
    return this.repository.voteWord(voteDto);
  }

  removeVote(voteDto: VoteDto) {
    return this.repository.removeVote(voteDto);
  }

  getWords(keyword: string, page: number, req): Promise<string> {
    return this.repository.getWords(keyword, page, req.ip);
  }
}
