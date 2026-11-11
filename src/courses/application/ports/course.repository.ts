import { Course } from '../../entities/course.entity.js';

/**
 * Token de inyeccion. Una interfaz de TypeScript no existe en tiempo de
 * ejecucion, asi que Nest necesita un simbolo con el que resolver la
 * dependencia.
 */
export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

/**
 * Puerto: lo unico que UpdateCourseUseCase necesita de la persistencia.
 * Son dos metodos a proposito. Una interfaz con todo el CRUD obligaria a
 * cualquier implementacion a escribir metodos que este caso de uso no usa.
 */
export interface CourseRepository {
  findById(id: number): Promise<Course | null>;
  save(course: Course): Promise<Course>;
}
