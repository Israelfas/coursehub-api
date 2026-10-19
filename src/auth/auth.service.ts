import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';

/** Rondas de bcrypt. No se baja para "ir mas rapido". */
const RONDAS = 12;

type UsuarioPublico = {
  id: number;
  email: string;
  createdAt: Date;
};

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto): Promise<UsuarioPublico> {
    const passwordHash = await bcrypt.hash(dto.password, RONDAS);
    const user = await this.usersService.create(dto.email, passwordHash);

    // La respuesta se arma campo por campo: nunca se devuelve la entidad.
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }
}
