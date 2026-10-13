import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { StudentsQueryDto } from './dto/students-query.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto.js';
import { Student } from './entities/student.entity.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
  ) {}

  findAll(filters: StudentsQueryDto): Promise<Student[]> {
    const where: FindOptionsWhere<Student> = {};

    if (filters.career !== undefined) {
      where.career = filters.career;
    }

    if (filters.semester !== undefined) {
      where.semester = filters.semester;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.students.find({ where });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.students.findOneBy({ id });

    if (!student) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    }

    return student;
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    await this.ensureEmailIsAvailable(createStudentDto.email);

    return this.students.save(this.students.create(createStudentDto));
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.findOne(id);

    if (
      updateStudentDto.email !== undefined &&
      updateStudentDto.email !== student.email
    ) {
      await this.ensureEmailIsAvailable(updateStudentDto.email, id);
    }

    return this.students.save(Object.assign(student, updateStudentDto));
  }

  async updateStatus(
    id: number,
    updateStudentStatusDto: UpdateStudentStatusDto,
  ): Promise<Student> {
    const student = await this.findOne(id);

    student.isActive = updateStudentStatusDto.isActive;
    return this.students.save(student);
  }

  async remove(id: number): Promise<Student> {
    const student = await this.findOne(id);

    if (!student.isActive) {
      throw new ConflictException(
        'No se puede eliminar un estudiante inactivo',
      );
    }

    const deleted = { ...student };

    await this.students.remove(student);
    return deleted;
  }

  private async ensureEmailIsAvailable(
    email: string,
    exceptId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<Student> = { email };

    if (exceptId !== undefined) {
      where.id = Not(exceptId);
    }

    const studentWithEmail = await this.students.findOne({ where });

    if (studentWithEmail) {
      throw new ConflictException('Ya existe un estudiante con este correo');
    }
  }
}
