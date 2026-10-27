/** Claims mínimos y no sensibles incluidos en cada access token. */
export type JwtPayload = {
  sub: number;
  email: string;
};
