import * as mysql from 'mysql2/promise';
import { Injectable, Inject } from '@nestjs/common';
import databaseConfig from './config/database.config';
import { ConfigType } from '@nestjs/config';
import { VoteDto, WordDto } from './app.model';

@Injectable()
export class Repository {
  pool: mysql.Pool;
  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: ConfigType<typeof databaseConfig>,
  ) {
    this.pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
    });
  }

  async createWord(wordDto: WordDto) {
    const { word, meaning } = wordDto;
    const connection = await this.pool.getConnection();
    console.log('createWord');
    try {
      const [rows] = await connection.query(`SELECT COUNT(word_id) AS n
      FROM words
      WHERE word='${word}' AND meaning='${meaning}'`);
      const n = rows[0]['n'];
      if (n === 0) {
        const result = await connection.query(
          `INSERT INTO words (word, meaning) VALUES ('${word}', '${meaning}')`,
        );
        const [id] = await connection.query(`SELECT LAST_INSERT_ID() as id`);
        const result2 = await connection.query(
          `INSERT INTO vote (like_amount, dislike_amount, word_id) VALUES (0, 0, ${id[0].id})`,
        );
        return 'OK';
      }
    } catch (error) {
      console.log(error);
      return 'fail';
    } finally {
      connection.release();
    }
  }

  async resetVote(
    word_id: number,
    ip: string,
    connection: mysql.PoolConnection,
  ) {
    const [result] = await connection.query(
      `SELECT word_id, isLike FROM ip WHERE ip='${ip}' AND word_id='${word_id}'`,
    );
    console.log(result);
    if (JSON.parse(JSON.stringify(result)).length === 0) return;
    const like = result['isLike'] === 1 ? 'like' : 'dislike';
    await connection.query(
      `DELETE FROM ip WHERE ip='${ip}' AND word_id='${word_id}'`,
    );
    await connection.query(
      `UPDATE vote SET ${like}_amount = ${like}_amount - 1 WHERE word_id=${word_id}`,
    );
    await this.setPriority(word_id, connection);
    return 'OK';
  }

  async setPriority(word_id: number, connection: mysql.PoolConnection) {
    await connection.query(
      `update vote set priority = like_amount - dislike_amount where word_id='${word_id}'`,
    );
  }

  async voteWord(voteDto: VoteDto) {
    const { ip, word_id, vote } = voteDto;
    const connection = await this.pool.getConnection();
    try {
      await this.resetVote(word_id, ip, connection);
      const updateResult = await connection.query(
        `UPDATE vote SET ${vote}_amount = ${vote}_amount + 1 WHERE word_id = '${word_id}'`,
      );
      const insertResult = await connection.query(
        `INSERT INTO ip (word_id, ip, isLike) VALUES (${word_id}, '${ip}', ${vote === 'like' ? 1 : 0})`,
      );
      await this.setPriority(word_id, connection);
      return 'OK';
    } catch (err) {
      console.log(err);
      return 'fail';
    } finally {
      connection.release();
    }
  }

  async removeVote(voteDto: VoteDto) {
    const { ip, word_id } = voteDto;
    const connection = await this.pool.getConnection();
    try {
      await this.resetVote(word_id, ip, connection);
      return 'OK';
    } catch (err) {
      console.log(err);
      return 'fail';
    } finally {
      connection.release();
    }
  }

  async getWords(keyword: string, page: number) {
    const connection = await this.pool.getConnection();
    try {
      const wordPerPage = 10;
      const result = await connection.query(`SELECT w.word, w.meaning
      FROM words AS w
      INNER JOIN vote AS v
      ON w.word_id = v.word_id
      WHERE w.word LIKE '%${keyword}%'
      ORDER BY CASE
      WHEN w.word LIKE '${keyword}' THEN 0
      WHEN w.word LIKE '${keyword}%' THEN 1
      WHEN w.word LIKE '%${keyword}%' THEN 2
      ELSE 3 END, v.priority DESC
      LIMIT ${wordPerPage * page}, ${wordPerPage}`);
      const [ret] = result;
      return JSON.stringify(ret);
    } catch (error) {
      console.log(error);
    } finally {
      connection.release();
    }
  }
}
