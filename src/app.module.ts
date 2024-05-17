import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Repository } from './app.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LogIn } from './app.login';
import { JwtModule } from '@nestjs/jwt';
import { CustomJwt } from './app.jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${__dirname}/config/.${process.env.NODE_ENV}.env`,
    }),
    HttpModule,
    JwtModule.register({}),
  ],
  controllers: [AppController],
  providers: [AppService, Repository, LogIn, CustomJwt],
})
export class AppModule {}
