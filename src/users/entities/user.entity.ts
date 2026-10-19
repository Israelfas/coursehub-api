import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;
}
