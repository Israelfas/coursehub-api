import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DatabaseConstraintFilter } from './common/filters/database-constraint.filter.js';
import { HttpErrorFilter } from './common/filters/http-error.filter.js';
import { TimingInterceptor } from './common/interceptors/timing.interceptor.js';

/**
 * Componentes globales de la API: validacion, forma de los errores y tiempos.
 *
 * Viven en una sola funcion para que main.ts y las pruebas e2e configuren la
 * aplicacion exactamente igual. Si cada prueba repitiera esta lista, podria
 * quedar desfasada y se estaria probando una API distinta a la que se ejecuta.
 */
export function configurarAplicacion(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // El general va primero y el especifico despues: Nest evalua los filtros
  // globales en orden inverso al de registro, asi que DatabaseConstraintFilter
  // atrapa QueryFailedError antes de que llegue al catch-all.
  app.useGlobalFilters(new HttpErrorFilter(), new DatabaseConstraintFilter());
  app.useGlobalInterceptors(new TimingInterceptor());
}
