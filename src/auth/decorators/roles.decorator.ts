import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user-role.enum.js';

export const ROLES_KEY = 'roles';

/**
 * Declara que roles pueden ejecutar una ruta. Por si solo no concede acceso:
 * solo deja la politica escrita junto al endpoint para que RolesGuard la lea.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
