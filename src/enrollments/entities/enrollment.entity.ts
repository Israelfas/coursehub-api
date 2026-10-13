import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import type { Course } from '../../courses/entities/course.entity.js';
import type { Student } from '../../students/entities/student.entity.js';

@Entity('enrollments')
@Unique('UQ_enrollment_student_course', ['studentId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  courseId: number;

  @ManyToOne('Student', 'enrollments', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Relation<Student>;

  @ManyToOne('Course', 'enrollments', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Relation<Course>;
}
