import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Enrollments endpoints (e2e)', () => {
  let app: INestApplication<App>;

  const activeStudent = {
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

  async function createActiveStudent() {
    await request(app.getHttpServer())
      .post('/students')
      .send(activeStudent)
      .expect(201);
  }

  it('creates an enrollment and lists it through every requested route', async () => {
    await createActiveStudent();

    await request(app.getHttpServer())
      .post('/enrollments')
      .send({ studentId: 1, courseId: 1 })
      .expect(201)
      .expect({ id: 1, studentId: 1, courseId: 1 });

    const expectedEnrollment = [{ id: 1, studentId: 1, courseId: 1 }];
    await request(app.getHttpServer())
      .get('/enrollments?studentId=1&courseId=1')
      .expect(200)
      .expect(expectedEnrollment);
    await request(app.getHttpServer())
      .get('/students/1/enrollments')
      .expect(200)
      .expect(expectedEnrollment);
    await request(app.getHttpServer())
      .get('/courses/1/enrollments')
      .expect(200)
      .expect(expectedEnrollment);
  });

  it('rejects duplicate enrollments and inactive students', async () => {
    await createActiveStudent();
    await request(app.getHttpServer())
      .post('/enrollments')
      .send({ studentId: 1, courseId: 1 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/enrollments')
      .send({ studentId: 1, courseId: 1 })
      .expect(409);

    await request(app.getHttpServer())
      .patch('/students/1/status')
      .send({ isActive: false })
      .expect(200);
    await request(app.getHttpServer())
      .post('/enrollments')
      .send({ studentId: 1, courseId: 2 })
      .expect(409);
  });

  it('returns 404 when a referenced student or course does not exist', async () => {
    await createActiveStudent();

    await request(app.getHttpServer())
      .post('/enrollments')
      .send({ studentId: 999, courseId: 1 })
      .expect(404);
    await request(app.getHttpServer())
      .post('/enrollments')
      .send({ studentId: 1, courseId: 999 })
      .expect(404);
  });

  it('cancels an enrollment and reports an unknown enrollment', async () => {
    await createActiveStudent();
    await request(app.getHttpServer())
      .post('/enrollments')
      .send({ studentId: 1, courseId: 1 })
      .expect(201);

    await request(app.getHttpServer())
      .delete('/enrollments/1')
      .expect(200)
      .expect({ id: 1, studentId: 1, courseId: 1 });
    await request(app.getHttpServer()).delete('/enrollments/1').expect(404);
  });

  it('rejects invalid body data and route ids', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .send({ studentId: 0, courseId: 1 })
      .expect(400);
    await request(app.getHttpServer()).delete('/enrollments/no').expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
