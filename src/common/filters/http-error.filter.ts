import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { construirRespuesta } from './error-response.js';

/** Traduce cualquier excepcion a una respuesta HTTP con la misma forma. */
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const esHttp = exception instanceof HttpException;
    const status = esHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Error interno del servidor';

    if (esHttp) {
      const cuerpo = exception.getResponse();
      message =
        typeof cuerpo === 'string'
          ? cuerpo
          : ((cuerpo as { message?: string | string[] }).message ??
            exception.message);
    } else {
      // Un 500 no revela la causa: una traza, una consulta SQL o el nombre de
      // una variable de entorno le sirven a quien busca una via de entrada.
      // El detalle queda en el registro interno, no en la respuesta.
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response
      .status(status)
      .json(construirRespuesta(status, request.url, message));
  }
}
