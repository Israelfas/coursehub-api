import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user-role.enum.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  /**
   * Se llama passwordHash y no password para que sea dificil confundirlo con
   * el secreto. select: false lo deja fuera de las consultas normales; aun asi
   * la respuesta se construye con campos seguros de forma explicita.
   */
  @Column({ select: false })
  passwordHash: string;

  /**
   * Por defecto, el rol de menor privilegio. Una cuenta nueva no puede
   * administrar nada hasta que alguien le asigne otro rol de forma explicita.
   */
  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}
