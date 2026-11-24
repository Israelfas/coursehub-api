import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';
import { CoursesModule } from './courses/courses.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { StudentsModule } from './students/students.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Las pruebas e2e leen .env.test, con su propia base de datos. En CI ese
      // archivo no existe y los valores llegan como variables de entorno.
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().port().default(5432),
        DB_NAME: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().allow('').required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const entorno = config.getOrThrow<string>('NODE_ENV');
        const baseDeDatos = config.getOrThrow<string>('DB_NAME');

        // En pruebas la base se borra al arrancar; exigir el sufijo _test evita
        // que un .env.test mal copiado apunte a la base de desarrollo.
        if (entorno === 'test' && !baseDeDatos.endsWith('_test')) {
          throw new Error(
            `NODE_ENV=test solo admite una base terminada en _test (recibida: ${baseDeDatos})`,
          );
        }

        return {
          type: 'postgres' as const,
          host: config.getOrThrow<string>('DB_HOST'),
          port: config.getOrThrow<number>('DB_PORT'),
          username: config.getOrThrow<string>('DB_USER'),
          password: config.getOrThrow<string>('DB_PASSWORD'),
          database: baseDeDatos,
          autoLoadEntities: true,
          // Solo en desarrollo y pruebas: en produccion el esquema se cambia con
          // migraciones revisadas, nunca de forma implicita al arrancar.
          synchronize: entorno !== 'production',
          // En pruebas cada arranque parte de un esquema vacio, asi el conjunto
          // e2e no depende de datos que quedaron de una ejecucion anterior.
          dropSchema: entorno === 'test',
        };
      },
    }),
    // Limite general: 20 solicitudes por minuto desde la misma direccion.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    CoursesModule,
    StudentsModule,
    EnrollmentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
