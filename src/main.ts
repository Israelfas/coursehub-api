import { Logger, ValidationPipe } from '@nestjs/common';
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

  const port = config.getOrThrow<number>('PORT');
  const entorno = config.getOrThrow<string>('NODE_ENV');

  await app.listen(port);

  // Solo datos no sensibles: nunca el objeto de configuracion completo,
  // que contiene la contrasena de la base.
  new Logger('Bootstrap').log(
    `CourseHub API escuchando en el puerto ${port} | NODE_ENV=${entorno} | ` +
      `synchronize=${entorno === 'development'}`,
  );
}
await bootstrap();
