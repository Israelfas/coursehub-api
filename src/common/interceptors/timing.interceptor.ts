import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';

/**
 * Mide cuanto tarda el manejador. Solo observa con tap: no transforma la
 * respuesta, no captura errores y no sustituye ninguna regla de negocio.
 */
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Timing');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const inicio = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const etiqueta = `${request.method} ${request.route?.path ?? request.url}`;

    return next
      .handle()
      .pipe(tap(() => this.logger.log(`${etiqueta} ${Date.now() - inicio}ms`)));
  }
}
