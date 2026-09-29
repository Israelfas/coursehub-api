import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseStudentIdPipe implements PipeTransform<string, number> {
  transform(value: string, _metadata: ArgumentMetadata): number {
    if (!/^\d+$/.test(value)) {
      throw new BadRequestException(
        'El id del estudiante debe ser un entero positivo',
      );
    }

    const id = Number(value);

    if (id < 1 || !Number.isSafeInteger(id)) {
      throw new BadRequestException(
        'El id del estudiante debe ser un entero positivo',
      );
    }

    return id;
  }
}
