import { CookieOptions } from 'express';

export interface WordDto {
  word: string;
  meaning: string;
  example: string;
  [key: string]: string;
}

export interface VoteDto {
  word_id: number;
  ip?: string;
  vote: 'like' | 'dislike';
  member_id?: string;
}

export interface KakaoToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
}

export interface JwtToken {
  expires_in?: number;
  aud?: string;
  sub?: string;
  id?: string;
  nickname?: string;
}

export interface Cookie {
  name: string;
  val: string;
  options: CookieOptions;
}
