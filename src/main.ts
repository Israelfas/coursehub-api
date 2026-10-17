import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DatabaseConstraintFilter } from './common/filters/database-constraint.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new DatabaseConstraintFilter(httpAdapter));

  const config = app.get(ConfigService);

  await app.listen(config.getOrThrow<number>('PORT'));
}
await bootstrap();
