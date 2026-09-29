import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { Course } from './entities/course.entity.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
  ) {}

  findAll(level?: string): Promise<Course[]> {
    return this.courses.find({ where: level ? { level } : {} });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courses.findOneBy({ id });

    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }

    return course;
  }

  create(createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courses.save(this.courses.create(createCourseDto));
  }

  async update(id: number, input: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    return this.courses.save(Object.assign(course, input));
  }

  async remove(id: number): Promise<Course> {
    const course = await this.findOne(id);

    await this.courses.remove(course);
    return course;
  }
}
