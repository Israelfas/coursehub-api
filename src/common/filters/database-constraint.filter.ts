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
 * PostgreSQL usa 23001 cuando una clave foranea con ON DELETE RESTRICT bloquea
 * el borrado, y 23503 cuando la fila referenciada no existe. Los dos casos se
 * traducen al mismo 409 porque ambos son conflictos con el estado de los datos.
 */
const RESTRICT_VIOLATION = '23001';
const FOREIGN_KEY_VIOLATION = '23503';

/**
 * PostgreSQL informa las columnas en conflicto dentro de `detail`, por ejemplo
 * "Key (email)=(ana@example.com) already exists". El texto cambia con el idioma
 * del servidor, pero el parentesis con las columnas no, asi que se extrae de ahi
 * en lugar de depender del nombre que TypeORM le haya dado a la restriccion.
 */
const COLUMNS_IN_DETAIL = /\(([^)]+)\)=/;

const UNIQUE_MESSAGES: Record<string, string> = {
  email: 'Ya existe un estudiante con este correo',
  'studentId, courseId': 'El estudiante ya está matriculado en este curso',
};

const FOREIGN_KEY_MESSAGES: Record<string, string> = {
  id: 'No se puede eliminar un recurso que todavía tiene matrículas',
  studentId: 'El estudiante referenciado no existe',
  courseId: 'El curso referenciado no existe',
};

type DriverError = { code?: string; detail?: string };

@Catch(QueryFailedError)
export class DatabaseConstraintFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const driverError = exception.driverError as DriverError | undefined;
    const code = driverError?.code;

    const isUnique = code === UNIQUE_VIOLATION;
    const isRelation =
      code === RESTRICT_VIOLATION || code === FOREIGN_KEY_VIOLATION;

    if (!isUnique && !isRelation) {
      super.catch(exception, host);
      return;
    }

    const columns =
      COLUMNS_IN_DETAIL.exec(driverError?.detail ?? '')?.[1] ?? '';
    const messages = isUnique ? UNIQUE_MESSAGES : FOREIGN_KEY_MESSAGES;
    const fallback = isUnique
      ? 'El registro infringe una restricción de unicidad'
      : 'La operación infringe una relación entre tablas';

    super.catch(new ConflictException(messages[columns] ?? fallback), host);
  }
}
