import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedUser } from '../types/jwt-payload.type.js';

/**
 * Entrega la identidad que JwtAuthGuard verifico. Se usa en lugar de leer un
 * id del cuerpo HTTP, que el cliente podria falsificar.
 */
export const CurrentUser = createParamDecorator(
  (_dato: unknown, context: ExecutionContext): AuthenticatedUser => {
    return context.switchToHttp().getRequest<{ user: AuthenticatedUser }>()
      .user;
  },
);
