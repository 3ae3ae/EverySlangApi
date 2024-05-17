import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:4173', 'https://everyslang.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Origin',
      'access-control-request-method',
      'access-control-request-headers',
      'Access-Control-Allow-Origin',
      'Authorization',
      'Content-Type',
      'Accept',
      'Cookie',
    ],
  });
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
