import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesService } from '../courses/courses.service.js';
import { StudentsService } from '../students/students.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';

type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
};

@Injectable()
export class EnrollmentsService {
  private readonly enrollments: Enrollment[] = [];
  private nextId = 1;

  constructor(
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  findAll(filters: EnrollmentsQueryDto): Enrollment[] {
    return this.enrollments.filter((enrollment) => {
      return (
        (filters.studentId === undefined ||
          enrollment.studentId === filters.studentId) &&
        (filters.courseId === undefined ||
          enrollment.courseId === filters.courseId)
      );
    });
  }

  findByStudent(studentId: number): Enrollment[] {
    this.studentsService.findOne(studentId);
    return this.findAll({ studentId });
  }

  findByCourse(courseId: number): Enrollment[] {
    this.coursesService.findOne(courseId);
    return this.findAll({ courseId });
  }

  create(createEnrollmentDto: CreateEnrollmentDto): Enrollment {
    const student = this.studentsService.findOne(createEnrollmentDto.studentId);
    this.coursesService.findOne(createEnrollmentDto.courseId);

    if (!student.isActive) {
      throw new ConflictException('Inactive students cannot be enrolled');
    }

    const duplicateEnrollment = this.enrollments.find(
      (enrollment) =>
        enrollment.studentId === createEnrollmentDto.studentId &&
        enrollment.courseId === createEnrollmentDto.courseId,
    );

    if (duplicateEnrollment) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    const enrollment: Enrollment = {
      id: this.nextId++,
      ...createEnrollmentDto,
    };
    this.enrollments.push(enrollment);
    return enrollment;
  }

  remove(id: number): Enrollment {
    const index = this.enrollments.findIndex(
      (enrollment) => enrollment.id === id,
    );

    if (index === -1) {
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    }

    const [enrollment] = this.enrollments.splice(index, 1);
    return enrollment;
  }
}
