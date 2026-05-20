import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`http://localhost:${process.env.PORT ?? 3000} server running`);
}

bootstrap();
