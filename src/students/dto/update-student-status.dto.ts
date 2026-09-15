import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateStudentStatusDto {
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive: boolean;
}
