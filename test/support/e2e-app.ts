import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { configurarAplicacion } from '../../src/app.setup.js';
import { User } from '../../src/users/entities/user.entity.js';
import { UserRole } from '../../src/users/entities/user-role.enum.js';

/** Contrasena de practica para las cuentas que crean las pruebas. */
export const CLAVE_DE_PRUEBA = 'clave-de-prueba-e2e';

/**
 * Levanta la aplicacion completa contra la base de pruebas, con la misma
 * configuracion global que main.ts. Si la base no termina en _test, la
 * validacion de AppModule detiene el arranque antes de tocar datos.
 */
export async function crearAppDePrueba(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();
  configurarAplicacion(app);
  await app.init();
  return app;
}

/** Deja todas las tablas vacias y reinicia los ids, para que cada caso parta igual. */
export async function vaciarBase(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  const tablas = dataSource.entityMetadatas
    .map((meta) => `"${meta.tableName}"`)
    .join(', ');
  await dataSource.query(`TRUNCATE ${tablas} RESTART IDENTITY CASCADE`);
}

/**
 * Crea una cuenta por la API, le asigna el rol pedido y devuelve su token.
 * El registro publico siempre crea estudiantes; el rol se ajusta directo en
 * la base porque no existe una ruta para elevarlo, igual que en desarrollo.
 */
export async function crearCuentaConToken(
  app: INestApplication,
  email: string,
  rol: UserRole,
): Promise<{ id: number; token: string }> {
  const servidor = app.getHttpServer();

  await request(servidor)
    .post('/auth/register')
    .send({ email, password: CLAVE_DE_PRUEBA })
    .expect(201);

  await app
    .get(DataSource)
    .getRepository(User)
    .update({ email }, { role: rol });

  const login = await request(servidor)
    .post('/auth/login')
    .send({ email, password: CLAVE_DE_PRUEBA })
    .expect(200);

  return { id: login.body.user.id, token: login.body.accessToken };
}
