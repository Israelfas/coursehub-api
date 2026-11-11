import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { COURSE_REPOSITORY } from './application/ports/course.repository.js';
import { UpdateCourseUseCase } from './application/update-course.use-case.js';
import { Course } from './entities/course.entity.js';
import { TypeOrmCourseRepository } from './infrastructure/typeorm-course.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), AuthModule],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    UpdateCourseUseCase,
    // El caso de uso pide COURSE_REPOSITORY; aqui se decide que implementacion
    // concreta lo satisface. Cambiarla no obliga a tocar la regla de negocio.
    { provide: COURSE_REPOSITORY, useClass: TypeOrmCourseRepository },
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
