import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesService } from '../courses/courses.service.js';
import { StudentsService } from '../students/students.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { Enrollment } from './entities/enrollment.entity.js';

type PaginatedEnrollments = {
  items: Enrollment[];
  meta: { total: number; page: number; limit: number };
};

@Injectable()
export class EnrollmentsService {
  /**
   * Columnas que se exponen de cada relacion. El correo del estudiante queda
   * fuera a proposito: leftJoinAndSelect traeria la entidad completa.
   */
  private static readonly CAMPOS = [
    'enrollment.id',
    'enrollment.studentId',
    'enrollment.courseId',
    'student.id',
    'student.name',
    'student.career',
    'student.semester',
    'student.isActive',
    'course.id',
    'course.title',
    'course.level',
  ];

  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollments: Repository<Enrollment>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  async findAll(query: EnrollmentsQueryDto): Promise<PaginatedEnrollments> {
    const { search, studentId, courseId, activeOnly, page, limit } = query;

    const qb = this.enrollments
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course')
      .select(EnrollmentsService.CAMPOS);

    if (search) {
      qb.andWhere(
        '(student.name ILIKE :search OR course.title ILIKE :search)',
        {
          search: `%${search.trim()}%`,
        },
      );
    }

    if (studentId) {
      qb.andWhere('student.id = :studentId', { studentId });
    }

    if (courseId) {
      qb.andWhere('course.id = :courseId', { courseId });
    }

    // Se compara con la cadena 'true' a proposito: Boolean('false') es true.
    if (activeOnly === 'true') {
      qb.andWhere('student.isActive = :active', { active: true });
    }

    qb.orderBy('enrollment.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, meta: { total, page, limit } };
  }

  async findByStudent(
    studentId: number,
    query: EnrollmentsQueryDto,
  ): Promise<PaginatedEnrollments> {
    await this.studentsService.findOne(studentId);
    return this.findAll({ ...query, studentId });
  }

  async findByCourse(
    courseId: number,
    query: EnrollmentsQueryDto,
  ): Promise<PaginatedEnrollments> {
    await this.coursesService.findOne(courseId);
    return this.findAll({ ...query, courseId });
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

    return this.unaConRelaciones(enrollment.id);
  }

  async remove(id: number): Promise<Enrollment> {
    const enrollment = await this.unaConRelaciones(id);

    if (!enrollment) {
      throw new NotFoundException(`Matrícula con id ${id} no encontrada`);
    }

    const cancelled = { ...enrollment };

    await this.enrollments.remove(enrollment);
    return cancelled;
  }

  /** Una matricula con sus datos relacionados, usando las mismas columnas. */
  private unaConRelaciones(id: number): Promise<Enrollment | null> {
    return this.enrollments
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course')
      .select(EnrollmentsService.CAMPOS)
      .where('enrollment.id = :id', { id })
      .getOne();
  }
}
