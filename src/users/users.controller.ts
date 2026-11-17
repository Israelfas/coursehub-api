import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from './entities/user-role.enum.js';
import { UsersService } from './users.service.js';

/**
 * Ruta exclusiva de administracion: ver el listado de cuentas y sus roles.
 * Una identidad valida sin el rol admin recibe 403, no 401: el token es
 * correcto, lo que falta es el permiso.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }
}
