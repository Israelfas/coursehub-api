import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import type { Enrollment } from '../../enrollments/entities/enrollment.entity.js';
import type { User } from '../../users/entities/user.entity.js';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  level: string;

  /**
   * Quien creo el curso. Es nullable porque los cursos anteriores a la Semana
   * 10 no tienen dueno; esos solo puede editarlos un administrador.
   * El valor nunca se toma del cuerpo HTTP, sino de la identidad autenticada.
   */
  @Column({ nullable: true })
  createdByUserId: number | null;

  @ManyToOne('User', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: Relation<User> | null;

  @OneToMany('Enrollment', 'course')
  enrollments: Relation<Enrollment>[];
}
