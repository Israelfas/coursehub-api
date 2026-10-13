import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';

/**
 * PostgreSQL informa las columnas en conflicto dentro de `detail`, por ejemplo
 * "Key (email)=(ana@example.com) already exists". El texto cambia con el idioma
 * del servidor, pero el parentesis con las columnas no, asi que se extrae de ahi
 * en lugar de depender del nombre que TypeORM le haya dado a la restriccion.
 */
const COLUMNS_IN_DETAIL = /\(([^)]+)\)=/;

const MESSAGES_BY_COLUMNS: Record<string, string> = {
  email: 'Ya existe un estudiante con este correo',
  'studentId, courseId': 'El estudiante ya está matriculado en este curso',
};

type DriverError = { code?: string; detail?: string };

@Catch(QueryFailedError)
export class UniqueViolationFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const driverError = exception.driverError as DriverError | undefined;

    if (driverError?.code !== UNIQUE_VIOLATION) {
      super.catch(exception, host);
      return;
    }

    const columns = COLUMNS_IN_DETAIL.exec(driverError.detail ?? '')?.[1] ?? '';
    const message =
      MESSAGES_BY_COLUMNS[columns] ??
      'El registro infringe una restricción de unicidad';

    super.catch(new ConflictException(message), host);
  }
}
