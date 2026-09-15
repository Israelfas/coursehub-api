import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { StudentsQueryDto } from './dto/students-query.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto.js';

type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  career: string;
  semester: number;
  isActive: boolean;
};

@Injectable()
export class StudentsService {
  private nextId = 1;
  private students: Student[] = [];

  findAll(filters: StudentsQueryDto): Student[] {
    return this.students.filter((student) => {
      return (
        (filters.career === undefined || student.career === filters.career) &&
        (filters.semester === undefined ||
          student.semester === filters.semester) &&
        (filters.isActive === undefined ||
          student.isActive === filters.isActive)
      );
    });
  }

  findOne(id: number): Student {
    const student = this.students.find((item) => item.id === id);

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student;
  }

  create(createStudentDto: CreateStudentDto): Student {
    this.ensureEmailIsAvailable(createStudentDto.email);

    const student: Student = { id: this.nextId++, ...createStudentDto };
    this.students.push(student);
    return student;
  }

  update(id: number, updateStudentDto: UpdateStudentDto): Student {
    const student = this.findOne(id);

    if (
      updateStudentDto.email !== undefined &&
      updateStudentDto.email !== student.email
    ) {
      this.ensureEmailIsAvailable(updateStudentDto.email);
    }

    Object.assign(student, updateStudentDto);
    return student;
  }

  updateStatus(
    id: number,
    updateStudentStatusDto: UpdateStudentStatusDto,
  ): Student {
    const student = this.findOne(id);
    student.isActive = updateStudentStatusDto.isActive;
    return student;
  }

  remove(id: number): Student {
    const student = this.findOne(id);

    if (!student.isActive) {
      throw new ConflictException('Inactive students cannot be deleted');
    }

    this.students.splice(this.students.indexOf(student), 1);
    return student;
  }

  private ensureEmailIsAvailable(email: string): void {
    const studentWithEmail = this.students.find(
      (student) => student.email === email,
    );

    if (studentWithEmail) {
      throw new ConflictException('A student with this email already exists');
    }
  }
}
