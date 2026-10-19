import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  email: string;

  /**
   * La contrasena no se recorta ni se pasa a minusculas: cambiarla en silencio
   * alteraria el secreto que la persona eligio. El tope de 72 responde a como
   * bcrypt procesa la entrada.
   */
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
