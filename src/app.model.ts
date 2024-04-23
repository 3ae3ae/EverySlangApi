export interface WordDto {
  word: string;
  meaning: string;
  [key: string]: string;
}

export interface VoteDto {
  word_id: number;
  ip?: string;
  vote: 'like' | 'dislike';
}
