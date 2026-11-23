import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { UserRole } from '../users/entities/user-role.enum.js';
import { UpdateCourseUseCase } from './application/update-course.use-case.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

describe('CoursesController', () => {
  // Se simula el caso de uso, no el controlador: aqui solo importa que el
  // puente HTTP entregue los argumentos correctos. La regla de propiedad ya
  // tiene sus propias pruebas en update-course.use-case.spec.ts.
  const updateCourse = { ejecutar: vi.fn() };
  const coursesService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  };
  let controller: CoursesController;

  const actor: AuthenticatedUser = {
    id: 4,
    email: 'docente.a@example.test',
    role: UserRole.TEACHER,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: coursesService },
        { provide: UpdateCourseUseCase, useValue: updateCourse },
      ],
    })
      // Los guards no participan cuando se llama al metodo directamente; se
      // reemplazan para no tener que montar Passport ni JWT en una prueba unitaria.
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(CoursesController);
  });

  it('delega la actualización con el id, el DTO y la identidad autenticada', async () => {
    const dto = { level: 'advanced' };
    const actualizado = { id: 7, title: 'NestJS', ...dto, createdByUserId: 4 };
    updateCourse.ejecutar.mockResolvedValue(actualizado);

    await expect(controller.update(7, dto, actor)).resolves.toEqual(
      actualizado,
    );

    expect(updateCourse.ejecutar).toHaveBeenCalledTimes(1);
    expect(updateCourse.ejecutar).toHaveBeenCalledWith(7, dto, actor);
    // El controlador no salta al servicio general para actualizar.
    expect(coursesService.findOne).not.toHaveBeenCalled();
  });

  it('propaga el error del caso de uso en vez de convertirlo en un éxito', async () => {
    updateCourse.ejecutar.mockRejectedValue(
      new ForbiddenException('Solo puede modificar los cursos que creó'),
    );

    await expect(
      controller.update(7, { level: 'advanced' }, actor),
    ).rejects.toThrow(ForbiddenException);
  });
});
