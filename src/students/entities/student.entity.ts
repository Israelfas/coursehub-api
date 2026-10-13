import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import type { Enrollment } from '../../enrollments/entities/enrollment.entity.js';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  age: number;

  @Column()
  career: string;

  @Column()
  semester: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('Enrollment', 'student')
  enrollments: Relation<Enrollment>[];
}
