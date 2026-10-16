import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { EnrollmentsService } from './enrollments.service.js';

@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('enrollments')
  findAll(@Query() query: EnrollmentsQueryDto) {
    return this.enrollmentsService.findAll(query);
  }

  @Get('students/:studentId/enrollments')
  findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query() query: EnrollmentsQueryDto,
  ) {
    return this.enrollmentsService.findByStudent(studentId, query);
  }

  @Get('courses/:courseId/enrollments')
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query() query: EnrollmentsQueryDto,
  ) {
    return this.enrollmentsService.findByCourse(courseId, query);
  }

  @Post('enrollments')
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Delete('enrollments/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
