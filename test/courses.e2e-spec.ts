import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Courses endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  it('lists every course', () => {
    return request(app.getHttpServer())
      .get('/courses')
      .expect(200)
      .expect([
        { id: 1, title: 'NestJS Fundamentals', level: 'beginner' },
        { id: 2, title: 'REST APIs with NestJS', level: 'beginner' },
        { id: 3, title: 'NestJS Architecture', level: 'intermediate' },
      ]);
  });

  it('gets a course by id', () => {
    return request(app.getHttpServer())
      .get('/courses/2')
      .expect(200)
      .expect({ id: 2, title: 'REST APIs with NestJS', level: 'beginner' });
  });

  it('filters courses by level', () => {
    return request(app.getHttpServer())
      .get('/courses?level=intermediate')
      .expect(200)
      .expect([{ id: 3, title: 'NestJS Architecture', level: 'intermediate' }]);
  });

  it('creates, updates, and removes a course', async () => {
    const createdCourse = {
      id: 4,
      title: 'Testing NestJS',
      level: 'intermediate',
    };

    await request(app.getHttpServer())
      .post('/courses')
      .send({ title: createdCourse.title, level: createdCourse.level })
      .expect(201)
      .expect(createdCourse);

    await request(app.getHttpServer())
      .get('/courses/4')
      .expect(200)
      .expect(createdCourse);

    await request(app.getHttpServer())
      .patch('/courses/4')
      .send({ title: 'Testing APIs with NestJS' })
      .expect(200)
      .expect({ ...createdCourse, title: 'Testing APIs with NestJS' });

    await request(app.getHttpServer())
      .delete('/courses/4')
      .expect(200)
      .expect({ ...createdCourse, title: 'Testing APIs with NestJS' });

    await request(app.getHttpServer())
      .get('/courses')
      .expect(200)
      .expect([
        { id: 1, title: 'NestJS Fundamentals', level: 'beginner' },
        { id: 2, title: 'REST APIs with NestJS', level: 'beginner' },
        { id: 3, title: 'NestJS Architecture', level: 'intermediate' },
      ]);
  });

  it('rejects a course with an empty title', () => {
    return request(app.getHttpServer())
      .post('/courses')
      .send({ title: '', level: 'beginner' })
      .expect(400)
      .expect((response) => {
        expect(response.body.message).toContain('title should not be empty');
      });
  });

  it('rejects a course with an unsupported level', () => {
    return request(app.getHttpServer())
      .post('/courses')
      .send({ title: 'Testing NestJS', level: 'expert' })
      .expect(400)
      .expect((response) => {
        expect(response.body.message).toContain(
          'level must be one of the following values: beginner, intermediate, advanced',
        );
      });
  });

  it('partially updates a course with a valid body', async () => {
    await request(app.getHttpServer())
      .patch('/courses/1')
      .send({ level: 'advanced' })
      .expect(200)
      .expect({ id: 1, title: 'NestJS Fundamentals', level: 'advanced' });

    await request(app.getHttpServer())
      .get('/courses/1')
      .expect(200)
      .expect({ id: 1, title: 'NestJS Fundamentals', level: 'advanced' });
  });

  it('rejects an invalid partial update without changing the course', async () => {
    await request(app.getHttpServer())
      .patch('/courses/1')
      .send({ level: 'expert' })
      .expect(400);

    await request(app.getHttpServer())
      .get('/courses/1')
      .expect(200)
      .expect({ id: 1, title: 'NestJS Fundamentals', level: 'beginner' });
  });

  it('returns 404 for operations on a missing course', async () => {
    await request(app.getHttpServer()).get('/courses/999').expect(404);
    await request(app.getHttpServer())
      .patch('/courses/999')
      .send({ level: 'advanced' })
      .expect(404);
    await request(app.getHttpServer()).delete('/courses/999').expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
