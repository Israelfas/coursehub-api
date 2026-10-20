import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOneBy({ email });
  }

  /**
   * Unica consulta que carga passwordHash, porque la columna es select: false.
   * El nombre deja claro que es excepcional: solo el flujo de autenticacion la
   * necesita. No usarla para listados ni perfiles.
   */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Recibe un hash ya calculado, nunca la contrasena. Asi no existe un metodo
   * create(email, password) que pudiera guardar el secreto por descuido.
   */
  async create(email: string, passwordHash: string): Promise<User> {
    const existente = await this.findByEmail(email);

    if (existente) {
      throw new ConflictException('Ya existe una cuenta con este correo');
    }

    return this.users.save(this.users.create({ email, passwordHash }));
  }
}
