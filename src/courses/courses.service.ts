import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { CoursesQueryDto } from './dto/courses-query.dto.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { UserRole } from '../users/entities/user-role.enum.js';
import { Course } from './entities/course.entity.js';

type PaginatedCourses = {
  items: Course[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
  ) {}

  async findAll(query: CoursesQueryDto): Promise<PaginatedCourses> {
    const { level, page, limit, sortBy, order } = query;

    const [items, total] = await this.courses.findAndCount({
      where: level ? { level } : {},
      order: { [sortBy]: order } as FindOptionsOrder<Course>,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courses.findOneBy({ id });

    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }

    return course;
  }

  create(
    createCourseDto: CreateCourseDto,
    actor: AuthenticatedUser,
  ): Promise<Course> {
    // El dueno sale de la identidad autenticada, nunca del cuerpo HTTP: si el
    // cliente pudiera enviarlo, cualquiera se declararia dueno de un curso.
    return this.courses.save(
      this.courses.create({ ...createCourseDto, createdByUserId: actor.id }),
    );
  }

  async update(
    id: number,
    input: UpdateCourseDto,
    actor: AuthenticatedUser,
  ): Promise<Course> {
    const course = await this.findOne(id);

    this.asegurarQuePuedeEditar(course, actor);

    return this.courses.save(Object.assign(course, input));
  }

  /**
   * La propiedad se comprueba aqui y no en un guard: RolesGuard no sabe quien
   * creo un curso sin consultarlo, y esa consulta pertenece al servicio.
   */
  private asegurarQuePuedeEditar(
    course: Course,
    actor: AuthenticatedUser,
  ): void {
    if (actor.role === UserRole.ADMIN) {
      return;
    }

    if (course.createdByUserId !== actor.id) {
      throw new ForbiddenException('Solo puede modificar los cursos que creó');
    }
  }

  async remove(id: number): Promise<Course> {
    const course = await this.findOne(id);

    await this.courses.remove(course);
    return course;
  }
}
