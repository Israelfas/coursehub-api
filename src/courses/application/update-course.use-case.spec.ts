import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthenticatedUser } from '../../auth/types/jwt-payload.type.js';
import { UserRole } from '../../users/entities/user-role.enum.js';
import { Course } from '../entities/course.entity.js';
import { COURSE_REPOSITORY } from './ports/course.repository.js';
import { UpdateCourseUseCase } from './update-course.use-case.js';

describe('UpdateCourseUseCase', () => {
  // Doble del puerto CourseRepository: reemplaza al adaptador TypeORM, asi que
  // ninguna prueba abre una conexion ni depende de filas de la base local.
  const courses = { findById: vi.fn(), save: vi.fn() };
  let useCase: UpdateCourseUseCase;

  const docenteDueno: AuthenticatedUser = {
    id: 4,
    email: 'docente.a@example.test',
    role: UserRole.TEACHER,
  };
  const otroDocente: AuthenticatedUser = {
    id: 9,
    email: 'docente.b@example.test',
    role: UserRole.TEACHER,
  };
  const administrador: AuthenticatedUser = {
    id: 1,
    email: 'admin@example.test',
    role: UserRole.ADMIN,
  };

  function curso(datos: Partial<Course> = {}): Course {
    return Object.assign(
      new Course(),
      { id: 7, title: 'NestJS', level: 'beginner', createdByUserId: 4 },
      datos,
    );
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UpdateCourseUseCase,
        { provide: COURSE_REPOSITORY, useValue: courses },
      ],
    }).compile();

    useCase = module.get(UpdateCourseUseCase);
    // save devuelve lo que recibe, como hace el adaptador real.
    courses.save.mockImplementation((course: Course) =>
      Promise.resolve(course),
    );
  });

  it('permite que el docente dueño actualice su propio curso', async () => {
    const existente = curso();
    courses.findById.mockResolvedValue(existente);

    const resultado = await useCase.ejecutar(
      7,
      { level: 'advanced' },
      docenteDueno,
    );

    expect(resultado.level).toBe('advanced');
    expect(courses.findById).toHaveBeenCalledWith(7);
    expect(courses.save).toHaveBeenCalledWith(existente);
  });

  it('permite que un administrador actualice un curso que no creó', async () => {
    courses.findById.mockResolvedValue(curso({ createdByUserId: 4 }));

    const resultado = await useCase.ejecutar(
      7,
      { title: 'NestJS avanzado' },
      administrador,
    );

    expect(resultado.title).toBe('NestJS avanzado');
    expect(courses.save).toHaveBeenCalledTimes(1);
  });

  it('lanza NotFoundException si el curso no existe y no guarda nada', async () => {
    courses.findById.mockResolvedValue(null);

    await expect(
      useCase.ejecutar(999999, { level: 'advanced' }, docenteDueno),
    ).rejects.toThrow(NotFoundException);
    expect(courses.save).not.toHaveBeenCalled();
  });

  it('rechaza con ForbiddenException a un docente que no es el dueño', async () => {
    const ajeno = curso({ createdByUserId: 4 });
    courses.findById.mockResolvedValue(ajeno);

    await expect(
      useCase.ejecutar(7, { level: 'advanced' }, otroDocente),
    ).rejects.toThrow(ForbiddenException);

    // El 403 no basta: el rechazo tampoco debe dejar el curso modificado.
    expect(courses.save).not.toHaveBeenCalled();
    expect(ajeno.level).toBe('beginner');
  });

  it('rechaza a un docente cuando el curso no tiene dueño registrado', async () => {
    // Los cursos anteriores a la Semana 10 tienen createdByUserId en null:
    // solo un administrador puede editarlos.
    courses.findById.mockResolvedValue(curso({ createdByUserId: null }));

    await expect(
      useCase.ejecutar(7, { level: 'advanced' }, docenteDueno),
    ).rejects.toThrow(ForbiddenException);
    expect(courses.save).not.toHaveBeenCalled();
  });
});
