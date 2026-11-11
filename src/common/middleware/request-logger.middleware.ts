import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/**
 * Registra metodo, ruta, estado y duracion de cada solicitud.
 *
 * Deliberadamente NO registra la cabecera Authorization, ni el cuerpo, ni
 * ningun parametro: ahi viajan tokens y contrasenas, y un archivo de registro
 * se copia, se comparte y sobrevive mucho mas que una peticion.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const inicio = Date.now();
    const { method, originalUrl } = request;

    response.on('finish', () => {
      const ms = Date.now() - inicio;
      this.logger.log(
        `${method} ${originalUrl} ${response.statusCode} ${ms}ms`,
      );
    });

    next();
  }
}
