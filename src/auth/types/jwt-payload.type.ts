/** Claims mínimos y no sensibles incluidos en cada access token. */
export type JwtPayload = {
  sub: number;
  email: string;
};

/** Identidad segura disponible en request.user tras verificar el JWT. */
export type AuthenticatedUser = {
  id: number;
  email: string;
};
