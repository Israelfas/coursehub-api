import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseRepository } from '../application/ports/course.repository.js';
import { Course } from '../entities/course.entity.js';

/**
 * Adaptador: la unica clase que sabe que detras hay TypeORM y PostgreSQL.
 * Si manana se cambiara el motor o el ORM, se reescribe esta y el caso de uso
 * queda intacto.
 */
@Injectable()
export class TypeOrmCourseRepository implements CourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
  ) {}

  findById(id: number): Promise<Course | null> {
    return this.courses.findOneBy({ id });
  }

  save(course: Course): Promise<Course> {
    return this.courses.save(course);
  }
}
