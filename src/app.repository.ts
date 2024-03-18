import mysql from 'mysql2/promise';
import { Injectable, Inject } from '@nestjs/common';
import databaseConfig from './config/database.config';
import { ConfigType } from '@nestjs/config';
import { VoteDto, WordDto } from './app.model';

@Injectable()
export class repository {
  pool: mysql.Pool;
  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: ConfigType<typeof databaseConfig>,
  ) {
    this.pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
    });
  }

  async createWord(wordDto: WordDto) {
    const { word, meaning } = wordDto;
    const connection = await this.pool.getConnection();
    try {
      const counter = `SELECT COUNT(word_id) AS n
      FROM words
      WHERE word=${word} AND meaning=$${meaning}`;
      const [rows] = await connection.query(counter);
      const n = rows['n'];
      if (n === 0) {
        const insertQuery = `INSERT INTO words (word, meaning) VALUES (${word}, ${meaning})`;
        const [result] = await connection.query(insertQuery);
        return true;
      }
    } catch (error) {
      return false;
    } finally {
      connection.release();
    }
  }

  async likeWord(voteDto: VoteDto) {
    const { ip, word_id } = voteDto;
    const connection = await this.pool.getConnection();
    try {
      const findSql = `SELECT COUNT(*) AS n
      FROM ip
      WHERE word_id=${word_id} AND like_ip=${ip}`;
      const [rows] = await connection.query(findSql);
      if (rows['n'] === 0) {
        const updateSql = `UPDATE vote SET like_amount = likeamount + 1 WHERE word_id = ${word_id}`;
        const insertSql = `INSERT INTO ip (word_id, like_ip) VALUES (${word_id}, ${ip})`;
        const updateResult = await connection.query(updateSql);
        const insertResult = await connection.query(insertSql);
      }
      return true;
    } catch (err) {
      return false;
    } finally {
      connection.release();
    }
  }
}
