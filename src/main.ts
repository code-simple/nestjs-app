import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './common/logger/winston-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: ['error', 'warn', 'debug', 'log'],
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });
  const config = app.get(ConfigService);
  const port = config.get<number>('APP_PORT', 4000);

  console.log('🌺🌺🌺🌺🌺 Port: ', port);

  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 50 }));

  // app.enableCors({
  //   origin: ['http://localhost:3000'],
  //   credentials: true,
  // });
  app.enableCors({ origin: true });
  app.useGlobalPipes(new ValidationPipe());

  app.use('/uploads', express.static(path.resolve('uploads')));

  await app
    .listen(port)
    .then(() =>
      console.log(
        `🚀 Apollo server running at: http://localhost:${port}/graphql`,
      ),
    );
}
bootstrap();
