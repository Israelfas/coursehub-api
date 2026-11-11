import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/types/jwt-payload.type.js';
import { UserRole } from '../../users/entities/user-role.enum.js';
import { UpdateCourseDto } from '../dto/update-course.dto.js';
import { Course } from '../entities/course.entity.js';
import { COURSE_REPOSITORY } from './ports/course.repository.js';
import type { CourseRepository } from './ports/course.repository.js';

/**
 * Regla de negocio de actualizar un curso, aislada de HTTP y de TypeORM.
 *
 * No conoce Express ni peticiones: recibe datos ya validados y la identidad
 * que un guard verifico. Tampoco conoce PostgreSQL: habla con el puerto
 * CourseRepository. Por eso se puede probar sin levantar la aplicacion ni la
 * base de datos.
 */
@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courses: CourseRepository,
  ) {}

  async ejecutar(
    id: number,
    cambios: UpdateCourseDto,
    actor: AuthenticatedUser,
  ): Promise<Course> {
    const course = await this.courses.findById(id);

    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }

    // Un administrador edita cualquier curso; un docente, solo el suyo.
    const esDueno = course.createdByUserId === actor.id;

    if (actor.role !== UserRole.ADMIN && !esDueno) {
      throw new ForbiddenException('Solo puede modificar los cursos que creó');
    }

    return this.courses.save(Object.assign(course, cambios));
  }
}
