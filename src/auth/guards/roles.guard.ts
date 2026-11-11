import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user-role.enum.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { AuthenticatedUser } from '../types/jwt-payload.type.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin @Roles() la ruta no declara politica de autorizacion: basta con la
    // identidad que ya comprobo JwtAuthGuard.
    if (!requeridos?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();

    // Depende de que JwtAuthGuard se ejecute antes y deje request.user puesto.
    // Por eso el orden en @UseGuards importa: primero identidad, luego permiso.
    if (!request.user || !requeridos.includes(request.user.role)) {
      throw new ForbiddenException(
        'Su cuenta no tiene permiso para esta acción',
      );
    }

    return true;
  }
}
