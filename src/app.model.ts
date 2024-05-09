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

export interface Token {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
}
