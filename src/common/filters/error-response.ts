/**
 * Forma unica de los errores que salen de la API. La comparten el filtro
 * general y el de restricciones de base de datos, para que un cliente no tenga
 * que distinguir dos formatos.
 */
export type ErrorResponse = {
  statusCode: number;
  path: string;
  timestamp: string;
  message: string | string[];
};

export function construirRespuesta(
  statusCode: number,
  path: string,
  message: string | string[],
): ErrorResponse {
  return {
    statusCode,
    path,
    timestamp: new Date().toISOString(),
    message,
  };
}
