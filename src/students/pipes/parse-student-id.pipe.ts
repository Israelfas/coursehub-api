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
      throw new BadRequestException('Student id must be a positive integer');
    }

    const id = Number(value);

    if (id < 1 || !Number.isSafeInteger(id)) {
      throw new BadRequestException('Student id must be a positive integer');
    }

    return id;
  }
}
