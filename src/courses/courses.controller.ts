import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { UserRole } from '../users/entities/user-role.enum.js';
import { CoursesQueryDto } from './dto/courses-query.dto.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateCourseUseCase } from './application/update-course.use-case.js';
import { CoursesService } from './courses.service.js';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly updateCourse: UpdateCourseUseCase,
  ) {}

  @Get()
  findAll(@Query() query: CoursesQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  // El orden de los guards importa: primero identidad, luego permiso.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.coursesService.create(createCourseDto, actor);
  }

  /**
   * Administradores y docentes pueden intentarlo; que el docente sea el dueno
   * lo decide UpdateCourseUseCase, porque el guard no conoce el curso.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    // El controlador solo traduce HTTP: la regla vive en el caso de uso.
    return this.updateCourse.ejecutar(id, updateCourseDto, actor);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
