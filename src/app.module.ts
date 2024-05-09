import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Repository } from './app.repository';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LogIn } from './app.login';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${__dirname}/config/.${process.env.NODE_ENV}.env`,
    }),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, Repository, LogIn],
})
export class AppModule {}
