import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
const CORS_ORIGINS = process.env.CORS_ORIGINS.split(',');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({
    origin: CORS_ORIGINS,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  console.log(configService.get('PORT'));
  await app.listen(configService.getOrThrow('PORT'));
}
bootstrap();
