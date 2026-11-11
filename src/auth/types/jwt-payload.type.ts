import { UserRole } from '../../users/entities/user-role.enum.js';

/** Claims mínimos y no sensibles incluidos en cada access token. */
export type JwtPayload = {
  sub: number;
  email: string;
  role: UserRole;
};

/** Identidad segura disponible en request.user tras verificar el JWT. */
export type AuthenticatedUser = {
  id: number;
  email: string;
  role: UserRole;
};
