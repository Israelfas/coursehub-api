import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
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

  async login(dto: LoginDto): Promise<UsuarioPublico> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // No se vuelve a hashear para comparar con ===: la sal hace que dos hashes
    // de la misma contrasena sean distintos. bcrypt.compare decide.
    const coincide = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    // Mismo codigo y mismo mensaje tanto si el correo no existe como si la
    // contrasena no coincide: distinguirlos permitiria averiguar que correos
    // estan registrados.
    if (!user || !coincide) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }
}
