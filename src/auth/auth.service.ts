import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtPayload } from './types/jwt-payload.type.js';

/** Rondas de bcrypt. No se baja para "ir mas rapido". */
const RONDAS = 12;

type UsuarioPublico = {
  id: number;
  email: string;
  createdAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UsuarioPublico> {
    const passwordHash = await bcrypt.hash(dto.password, RONDAS);
    const user = await this.usersService.create(dto.email, passwordHash);

    // La respuesta se arma campo por campo: nunca se devuelve la entidad.
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; user: UsuarioPublico }> {
    const user = await this.validateCredentials(dto.email, dto.password);
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }

  private async validateCredentials(
    email: string,
    password: string,
  ): Promise<UsuarioPublico> {
    const user = await this.usersService.findByEmailWithPassword(email);

    // No se vuelve a hashear para comparar con ===: la sal hace que dos hashes
    // de la misma contrasena sean distintos. bcrypt.compare decide.
    const coincide = user
      ? await bcrypt.compare(password, user.passwordHash)
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
