import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  mkdirSync(dirname(resolve(env.databasePath)), { recursive: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // O adapter padrão do Nest é o Express; a pasta public é o frontend.
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(env.port);
  console.log(`${env.appName} (${env.nodeEnv}) disponível em http://localhost:${env.port}`);
}

bootstrap();
