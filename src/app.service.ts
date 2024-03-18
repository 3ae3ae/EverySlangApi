import { Injectable, Inject } from '@nestjs/common';
import databaseConfig from './config/database.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: ConfigType<typeof databaseConfig>,
  ) {}

  getHello(): string {
    console.log(process.env.NODE_ENV);
    console.log(process.env);
    console.log(this.config);
    console.log(__dirname);
    return 'process.env';
  }
}
