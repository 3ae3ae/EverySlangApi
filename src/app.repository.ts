import * as mysql from 'mysql2/promise';
import { Injectable } from '@nestjs/common';
import { VoteDto, WordDto } from './app.model';
import { ConfigService } from '@nestjs/config';
import { KakaoToken } from './app.model';

@Injectable()
export class Repository {
  pool: mysql.Pool;
  constructor(private readonly config: ConfigService) {
    this.pool = mysql.createPool({
      host: this.config.get('DATABASE_HOST'),
      user: this.config.get('DATABASE_USER'),
      password: this.config.get('DATABASE_PASSWORD'),
      database: this.config.get('DATABASE_NAME'),
    });
  }

  async getNickname(id: string) {
    const connection = await this.pool.getConnection();
    const e = (a) => connection.escape(a);
    try {
      const [result] = await connection.execute(
        `SELECT nickname FROM member WHERE member_id = ${e(id)}`,
      );
      return result[0]['nickname'];
    } catch (error) {
    } finally {
      connection.release();
    }
  }

  async createWord(wordDto: WordDto, member_id: string) {
    const { word, meaning } = wordDto;
    const connection = await this.pool.getConnection();
    const e = (a) => connection.escape(a);
    try {
      const [rows] = await connection.execute(`SELECT COUNT(word_id) AS n
      FROM words
      WHERE word=${e(word)} AND meaning=${e(meaning)}`);
      const n = rows[0]['n'];
      if (n === 0) {
        await connection.query('start transaction');
        const result = await connection.execute(
          `INSERT INTO words (word, meaning, member_id) VALUES (${e(word)}, ${e(meaning)}, ${e(member_id)})`,
        );
        const [id] = await connection.execute(`SELECT LAST_INSERT_ID() as id`);
        const result2 = await connection.execute(
          `INSERT INTO vote (like_amount, dislike_amount, word_id) VALUES (0, 0, ${e(id[0].id)})`,
        );
        await connection.query('commit');
      }
    } catch (error) {
      await connection.query('rollback');
    } finally {
      connection.release();
      return this.config.get('REDIRECT_URL');
    }
  }

  async resetVote(
    word_id: number,
    ip: string,
    connection: mysql.PoolConnection,
  ) {
    try {
      const e = (a) => connection.escape(a);
      const ei = (a) => connection.escapeId(a);
      await connection.query('start transaction');
      const [result] = await connection.execute(
        `SELECT word_id, isLike FROM ip WHERE ip=${e(ip)} AND word_id=${e(word_id)}`,
      );
      if (JSON.parse(JSON.stringify(result)).length === 0) return;
      const like = result[0]['isLike'] === 1 ? 'like' : 'dislike';
      await connection.execute(
        `DELETE FROM ip WHERE ip=${e(ip)} AND word_id=${e(word_id)}`,
      );
      await connection.execute(
        `UPDATE vote SET ${ei(`${like}_amount`)} = ${ei(`${like}_amount`)} - 1 WHERE word_id=${e(word_id)}`,
      );
      await this.setPriority(word_id, connection);
      await connection.query('commit');
      return 'OK';
    } catch (error) {
      await connection.query('rollback');
    }
  }

  async setPriority(word_id: number, connection: mysql.PoolConnection) {
    try {
      const e = (a) => connection.escape(a);
      const ei = (a) => connection.escapeId(a);
      await connection.execute(
        `update vote set priority = like_amount - dislike_amount where word_id='${e(word_id)}'`,
      );
    } catch (error) {}
  }

  async voteWord(voteDto: VoteDto) {
    const { ip, word_id, vote } = voteDto;
    const connection = await this.pool.getConnection();
    const e = (a) => connection.escape(a);
    const ei = (a) => connection.escapeId(a);
    try {
      await connection.query('start transaction');
      await this.resetVote(word_id, ip, connection);
      const updateResult = await connection.execute(
        `UPDATE vote SET ${ei(`${vote}_amount`)} = ${ei(`${vote}_amount`)} + 1 WHERE word_id = ${e(word_id)}`,
      );
      const insertResult = await connection.execute(
        `INSERT INTO ip (word_id, ip, isLike) VALUES (${e(word_id)}, ${e(ip)}, ${e(vote === 'like' ? 1 : 0)})`,
      );
      await this.setPriority(word_id, connection);
      await connection.query('commit');
      return 'OK';
    } catch (err) {
      await connection.query('rollback');
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
      return 'fail';
    } finally {
      connection.release();
    }
  }

  async getWords(keyword: string, page: number, ip: string) {
    const connection = await this.pool.getConnection();
    const e = (a) => connection.escape(a);
    try {
      const wordPerPage = 10;
      const result = await connection.execute(`SELECT 
    w.word, 
    w.meaning,
    v.like_amount,
    v.dislike_amount,
    COALESCE(i.isLike, -1) as isLike,
    w.word_id,
    w.member_id,
    m.nickname
    FROM 
        words AS w
    INNER JOIN 
        vote AS v ON w.word_id = v.word_id
    LEFT JOIN
        member AS m ON w.member_id = m.member_id
    LEFT JOIN 
        ip AS i ON w.word_id = i.word_id AND i.ip = ${e(ip)}
    WHERE 
        w.word LIKE ${e(`%${keyword}%`)}
    ORDER BY 
        CASE
        WHEN w.word LIKE ${e(`${keyword}`)} THEN 0
        WHEN w.word LIKE ${e(`${keyword}%`)} THEN 1
        WHEN w.word LIKE ${e(`%${keyword}`)} THEN 2
        ELSE 3 
    END, 
    v.priority DESC, w.word_id DESC
    LIMIT ${e(wordPerPage * page)}, ${e(wordPerPage)}`);

      const [ret] = result;
      return JSON.stringify(ret);
    } catch (error) {
      console.log(error);
    } finally {
      connection.release();
    }
  }

  async removeWord(word_id: number) {
    const connection = await this.pool.getConnection();
    const e = (a) => connection.escape(a);
    try {
      await connection.execute(
        `DELETE FROM ip WHERE ip.word_id = ${e(word_id)}`,
      );
      await connection.execute(
        `DELETE FROM vote WHERE vote.word_id = ${e(word_id)}`,
      );
      await connection.execute(
        `DELETE FROM words WHERE words.word_id = ${e(word_id)}`,
      );
    } catch (error) {
    } finally {
      connection.release();
    }
  }

  async isMember(id: string) {
    const e = (a) => connection.escape(a);
    const connection = await this.pool.getConnection();
    try {
      await connection.query('start transaction');
      const result = await connection.execute(
        `SELECT member_id FROM member WHERE member_id = ${e(id)}`,
      );
      const [ret] = result;
      await connection.query('commit');
      if (JSON.parse(JSON.stringify(ret)).length === 0) return false;
      return true;
    } catch (error) {
      await connection.query('rollback');
      return false;
    } finally {
      await connection.release();
    }
  }

  async checkNickname(name: string) {
    const connection = await this.pool.getConnection();
    const e = (a) => connection.escape(a);
    try {
      const [result] = await connection.execute(
        `SELECT nickname FROM member WHERE nickname = ${e(name)}`,
      );
      if (JSON.parse(JSON.stringify(result)).length === 0) return true;
      else return false;
    } catch (error) {
      return false;
    } finally {
      connection.release();
    }
  }

  async registerMember(id: string) {
    const e = (a) => connection.escape(a);
    const connection = await this.pool.getConnection();
    try {
      await connection.query('start transaction');
      await connection.execute(
        `INSERT INTO member (member_id) VALUES (${e(id)})`,
      );
      await connection.query('commit');
      return 'OK';
    } catch (error) {
      await connection.query('rollback');
      return 'FAIL';
    } finally {
      connection.release();
    }
  }

  async setNickname(name: string, id: string) {
    const e = (a) => connection.escape(a);
    const connection = await this.pool.getConnection();
    try {
      await connection.query('start transaction');
      const result = await connection.execute(
        `SELECT * from member where member_id = ${e(id)}`,
      );
      const [ret] = result;
      if (JSON.parse(JSON.stringify(ret)).length !== 1) throw new Error();

      await connection.execute(
        `UPDATE member SET nickname = ${e(name)} WHERE member_id = ${e(id)}`,
      );

      await connection.query('commit');
      return 'OK';
    } catch (error) {
      console.log(error);
      await connection.query('rollback');
      return 'FAIL';
    } finally {
      connection.release();
    }
  }
}
