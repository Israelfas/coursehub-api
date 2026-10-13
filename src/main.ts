import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UniqueViolationFilter } from './common/filters/unique-violation.filter.js';

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

  app.useGlobalFilters(new UniqueViolationFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
