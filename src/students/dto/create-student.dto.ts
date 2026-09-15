import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  age: number;

  @IsString()
  @IsNotEmpty()
  career: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  semester: number;

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive: boolean;
}
