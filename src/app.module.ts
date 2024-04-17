import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Repository } from './app.repository';

@Module({
  controllers: [AppController],
  providers: [AppService, Repository],
})
export class AppModule {}
