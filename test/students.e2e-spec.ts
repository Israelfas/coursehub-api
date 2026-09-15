import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Students endpoints (e2e)', () => {
  let app: INestApplication<App>;

  const student = {
    id: 1,
    name: 'Ana Pérez',
    email: 'ana@example.com',
    age: 20,
    career: 'Software Engineering',
    semester: 4,
    isActive: true,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('creates and retrieves a student', async () => {
    await request(app.getHttpServer())
      .post('/students')
      .send({ ...student, id: undefined })
      .expect(201)
      .expect(student);

    await request(app.getHttpServer())
      .get('/students/1')
      .expect(200)
      .expect(student);
  });

  it('filters students with combined optional filters', async () => {
    await request(app.getHttpServer())
      .post('/students')
      .send({ ...student, id: undefined })
      .expect(201);
    await request(app.getHttpServer())
      .post('/students')
      .send({
        name: 'Luis Mora',
        email: 'luis@example.com',
        age: 22,
        career: 'Software Engineering',
        semester: 5,
        isActive: false,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/students?career=Software%20Engineering&semester=4&isActive=true')
      .expect(200)
      .expect([student]);
  });

  it('rejects invalid student data and duplicate emails', async () => {
    await request(app.getHttpServer())
      .post('/students')
      .send({ ...student, id: undefined, semester: 11 })
      .expect(400);

    await request(app.getHttpServer())
      .post('/students')
      .send({ ...student, id: undefined })
      .expect(201);
    await request(app.getHttpServer())
      .post('/students')
      .send({ ...student, id: undefined, name: 'Another student' })
      .expect(409);
  });

  it('updates a student partially without allowing id changes', async () => {
    await request(app.getHttpServer())
      .post('/students')
      .send({ ...student, id: undefined })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/students/1')
      .send({ semester: 5 })
      .expect(200)
      .expect({ ...student, semester: 5 });

    await request(app.getHttpServer())
      .patch('/students/1')
      .send({ id: 2 })
      .expect(400);
  });

  it('changes status but does not delete inactive students', async () => {
    await request(app.getHttpServer())
      .post('/students')
      .send({ ...student, id: undefined })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/students/1/status')
      .send({ isActive: false })
      .expect(200)
      .expect({ ...student, isActive: false });

    await request(app.getHttpServer()).delete('/students/1').expect(409);

    await request(app.getHttpServer())
      .patch('/students/1/status')
      .send({ isActive: true })
      .expect(200);
    await request(app.getHttpServer()).delete('/students/1').expect(200);
    await request(app.getHttpServer()).get('/students/1').expect(404);
  });

  it('returns 400 for an invalid id and 404 for a missing student', async () => {
    await request(app.getHttpServer())
      .get('/students/not-a-number')
      .expect(400);
    await request(app.getHttpServer()).get('/students/999').expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
