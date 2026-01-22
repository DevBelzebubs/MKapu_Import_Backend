/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* ============================================
   administration/src/core/user/infrastructure/repository/user.repository.ts
   ============================================ */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepositoryPort } from '../../../../domain/ports/out/user-port-out';
import { UserOrmEntity } from '../../../entity/user-orm.entity';
import { Usuario } from '../../../../domain/entity/user-domain-entity';
import { UserMapper } from '../../../../application/mapper/user.mapper';

@Injectable()
export class UserRepository implements IUserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userOrmRepository: Repository<UserOrmEntity>,
  ) {}

  async save(user: Usuario): Promise<Usuario> {
    const userOrm = UserMapper.toOrmEntity(user);
    const saved = await this.userOrmRepository.save(userOrm);
    return UserMapper.toDomainEntity(saved);
  }

  async update(user: Usuario): Promise<Usuario> {
    const userOrm = UserMapper.toOrmEntity(user);
    await this.userOrmRepository.update(user.id_usuario!, userOrm);
    const updated = await this.userOrmRepository.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['sede'],
    });
    return UserMapper.toDomainEntity(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.userOrmRepository.delete(id);
  }

  async findById(id: number): Promise<Usuario | null> {
    const userOrm = await this.userOrmRepository.findOne({
      where: { id_usuario: id },
      relations: ['sede'],
    });

    return userOrm ? UserMapper.toDomainEntity(userOrm) : null;
  }

  async findByDni(dni: string): Promise<Usuario | null> {
    const userOrm = await this.userOrmRepository.findOne({
      where: { dni },
      relations: ['sede'],
    });

    return userOrm ? UserMapper.toDomainEntity(userOrm) : null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const userOrm = await this.userOrmRepository.findOne({
      where: { email },
      relations: ['sede'],
    });

    return userOrm ? UserMapper.toDomainEntity(userOrm) : null;
  }
  async findAll(filters?: {
    activo?: boolean;
    search?: string;
    id_sede?: number;
    genero?: 'M' | 'F';
  }): Promise<Usuario[]> {
    const queryBuilder = this.userOrmRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.sede', 'sede');

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('usuario.activo = :activo', {
        activo: filters.activo ? 1 : 0,
      });
    }

    if (filters?.id_sede) {
      queryBuilder.andWhere('usuario.id_sede = :id_sede', {
        id_sede: filters.id_sede,
      });
    }

    if (filters?.genero) {
      queryBuilder.andWhere('usuario.genero = :genero', {
        genero: filters.genero,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(usuario.usu_nom LIKE :search OR usuario.ape_pat LIKE :search OR usuario.ape_mat LIKE :search OR usuario.dni LIKE :search OR usuario.email LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const usersOrm = await queryBuilder.getMany();
    return usersOrm.map((userOrm) => UserMapper.toDomainEntity(userOrm));
  }

  async existsByDni(dni: string): Promise<boolean> {
    const count = await this.userOrmRepository.count({ where: { dni } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userOrmRepository.count({ where: { email } });
    return count > 0;
  }
}
