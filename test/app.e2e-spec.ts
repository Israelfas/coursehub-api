import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { crearAppDePrueba } from './support/e2e-app.js';

describe('Raíz de la API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await crearAppDePrueba();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / responde que la API está en línea, sin token', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('CourseHub API esta en linea!');
  });
});
