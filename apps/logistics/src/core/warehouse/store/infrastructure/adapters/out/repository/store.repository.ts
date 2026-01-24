
/* ============================================
   logistics/src/core/warehouse/store/infrastructure/adapters/out/repository/store.repository.ts
   ============================================ */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStoreRepositoryPort } from '../../../../domain/ports/out/store-port-out';
import { Store } from '../../../../domain/entity/store-domain-entity';
import { StoreOrmEntity } from '../../../entity/store-orm.entity';
import { StoreMapper } from '../../../../application/mapper/store.mapper';

@Injectable()
export class StoreRepository implements IStoreRepositoryPort {
  constructor(
    @InjectRepository(StoreOrmEntity)
    private readonly storeOrmRepository: Repository<StoreOrmEntity>,
  ) {}

  async save(store: Store): Promise<Store> {
    const storeOrm = StoreMapper.toOrmEntity(store);
    const saved = await this.storeOrmRepository.save(storeOrm);
    return StoreMapper.toDomainEntity(saved);
  }

  async update(store: Store): Promise<Store> {
    const storeOrm = StoreMapper.toOrmEntity(store);
    await this.storeOrmRepository.update(store.id_almacen!, storeOrm);
    const updated = await this.storeOrmRepository.findOne({
      where: { id_almacen: store.id_almacen },
    });
    return StoreMapper.toDomainEntity(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.storeOrmRepository.delete(id);
  }

  async findById(id: number): Promise<Store | null> {
    const storeOrm = await this.storeOrmRepository.findOne({
      where: { id_almacen: id },
    });
    return storeOrm ? StoreMapper.toDomainEntity(storeOrm) : null;
  }

  async findByCode(codigo: string): Promise<Store | null> {
    const storeOrm = await this.storeOrmRepository.findOne({
      where: { codigo },
    });
    return storeOrm ? StoreMapper.toDomainEntity(storeOrm) : null;
  }

  async findAll(filters?: {
    activo?: boolean;
    search?: string;
    ciudad?: string;
  }): Promise<Store[]> {
    const queryBuilder = this.storeOrmRepository.createQueryBuilder('almacen');

    if (filters?.activo !== undefined) {
      queryBuilder.andWhere('almacen.activo = :activo', {
        activo: filters.activo,
      });
    }

    if (filters?.ciudad) {
      queryBuilder.andWhere('almacen.ciudad = :ciudad', {
        ciudad: filters.ciudad,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(almacen.codigo LIKE :search OR almacen.nombre LIKE :search OR almacen.ciudad LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const storesOrm = await queryBuilder.getMany();
    return storesOrm.map((storeOrm) => StoreMapper.toDomainEntity(storeOrm));
  }

  async existsByCode(codigo: string): Promise<boolean> {
    const count = await this.storeOrmRepository.count({ where: { codigo } });
    return count > 0;
  }
}