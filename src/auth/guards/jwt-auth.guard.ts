import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Exige un Bearer JWT válido y no vencido para la ruta decorada. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
