import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { UserRole } from '../src/users/entities/user-role.enum.js';
import {
  crearAppDePrueba,
  crearCuentaConToken,
  vaciarBase,
} from './support/e2e-app.js';

describe('Cursos de punta a punta (e2e)', () => {
  let app: INestApplication;
  let docenteA: { id: number; token: string };
  let docenteB: { id: number; token: string };
  let cursoId: number;

  beforeAll(async () => {
    app = await crearAppDePrueba();
    await vaciarBase(app);
    // Las cuentas se crean una vez por archivo: el login admite 5 intentos
    // por minuto y repetirlo en cada caso haria fallar el conjunto con 429.
    docenteA = await crearCuentaConToken(
      app,
      'docente.a@e2e.test',
      UserRole.TEACHER,
    );
    docenteB = await crearCuentaConToken(
      app,
      'docente.b@e2e.test',
      UserRole.TEACHER,
    );
  });

  beforeEach(async () => {
    // Cada caso parte de un unico curso recien creado por el docente A.
    await app
      .get(DataSource)
      .query('TRUNCATE "enrollments", "courses" RESTART IDENTITY CASCADE');

    const creado = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${docenteA.token}`)
      .send({ title: 'Pruebas e2e', level: 'beginner' })
      .expect(201);
    cursoId = creado.body.id;
  });

  afterAll(async () => {
    await vaciarBase(app);
    await app.close();
  });

  it('ruta pública: GET /courses lista los cursos sin token', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/courses')
      .expect(200);

    expect(respuesta.body.meta.total).toBe(1);
    expect(respuesta.body.items).toEqual([
      {
        id: cursoId,
        title: 'Pruebas e2e',
        level: 'beginner',
        createdByUserId: docenteA.id,
      },
    ]);
  });

  it('ruta protegida: el docente dueño actualiza su curso y el cambio queda guardado', async () => {
    await request(app.getHttpServer())
      .patch(`/courses/${cursoId}`)
      .set('Authorization', `Bearer ${docenteA.token}`)
      .send({ level: 'advanced' })
      .expect(200)
      .expect(({ body }) => expect(body.level).toBe('advanced'));

    await request(app.getHttpServer())
      .get(`/courses/${cursoId}`)
      .expect(200)
      .expect(({ body }) => expect(body.level).toBe('advanced'));
  });

  it('rechazo: sin token la ruta protegida responde 401 y el curso no cambia', async () => {
    const respuesta = await request(app.getHttpServer())
      .patch(`/courses/${cursoId}`)
      .send({ level: 'advanced' })
      .expect(401);

    expect(respuesta.body).toMatchObject({
      statusCode: 401,
      path: `/courses/${cursoId}`,
    });
    await request(app.getHttpServer())
      .get(`/courses/${cursoId}`)
      .expect(({ body }) => expect(body.level).toBe('beginner'));
  });

  it('rechazo: otro docente recibe 403 con la forma de error común', async () => {
    const respuesta = await request(app.getHttpServer())
      .patch(`/courses/${cursoId}`)
      .set('Authorization', `Bearer ${docenteB.token}`)
      .send({ level: 'advanced' })
      .expect(403);

    expect(respuesta.body).toMatchObject({
      statusCode: 403,
      path: `/courses/${cursoId}`,
      message: 'Solo puede modificar los cursos que creó',
    });
    expect(typeof respuesta.body.timestamp).toBe('string');
  });

  it('rechazo: un id que no es número se detiene con 400 antes del caso de uso', async () => {
    await request(app.getHttpServer())
      .patch('/courses/abc')
      .set('Authorization', `Bearer ${docenteA.token}`)
      .send({ level: 'advanced' })
      .expect(400);
  });
});
