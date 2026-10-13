import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CoursesService } from '../courses/courses.service.js';
import { StudentsService } from '../students/students.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { Enrollment } from './entities/enrollment.entity.js';

@Injectable()
export class EnrollmentsService {
  private readonly relations: FindOptionsRelations<Enrollment> = {
    student: true,
    course: true,
  };

  private readonly select: FindOptionsSelect<Enrollment> = {
    id: true,
    studentId: true,
    courseId: true,
    student: {
      id: true,
      name: true,
      career: true,
      semester: true,
      isActive: true,
    },
    course: { id: true, title: true, level: true },
  };

  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollments: Repository<Enrollment>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  findAll(filters: EnrollmentsQueryDto): Promise<Enrollment[]> {
    const where: FindOptionsWhere<Enrollment> = {};

    if (filters.studentId !== undefined) {
      where.studentId = filters.studentId;
    }

    if (filters.courseId !== undefined) {
      where.courseId = filters.courseId;
    }

    return this.enrollments.find({
      where,
      relations: this.relations,
      select: this.select,
      order: { id: 'ASC' },
    });
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    await this.studentsService.findOne(studentId);
    return this.findAll({ studentId });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    await this.coursesService.findOne(courseId);
    return this.findAll({ courseId });
  }

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<Enrollment | null> {
    const { studentId, courseId } = createEnrollmentDto;
    const student = await this.studentsService.findOne(studentId);

    await this.coursesService.findOne(courseId);

    if (!student.isActive) {
      throw new BadRequestException(
        'Un estudiante inactivo no puede matricularse',
      );
    }

    const duplicateEnrollment = await this.enrollments.findOneBy({
      studentId,
      courseId,
    });

    if (duplicateEnrollment) {
      throw new ConflictException(
        'El estudiante ya está matriculado en este curso',
      );
    }

    const enrollment = await this.enrollments.save(
      this.enrollments.create({ studentId, courseId }),
    );

    return this.enrollments.findOne({
      where: { id: enrollment.id },
      relations: this.relations,
      select: this.select,
    });
  }

  async remove(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollments.findOne({
      where: { id },
      relations: this.relations,
      select: this.select,
    });

    if (!enrollment) {
      throw new NotFoundException(`Matrícula con id ${id} no encontrada`);
    }

    const cancelled = { ...enrollment };

    await this.enrollments.remove(enrollment);
    return cancelled;
  }
}
