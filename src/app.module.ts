import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { Repository } from './app.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${__dirname}/config/env/.${process.env.NODE_ENV}.env`,
      load: [databaseConfig],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, Repository],
})
export class AppModule {}
