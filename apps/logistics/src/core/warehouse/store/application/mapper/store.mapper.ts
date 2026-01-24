
/* ============================================
   APPLICATION LAYER - MAPPER
   logistics/src/core/warehouse/store/application/mapper/store.mapper.ts
   ============================================ */

import { Store } from '../../domain/entity/store-domain-entity';
import { RegisterStoreDto, UpdateStoreDto } from '../dto/in';
import {
  StoreResponseDto,
  StoreListResponse,
  StoreDeletedResponseDto,
} from '../dto/out';
import { StoreOrmEntity } from '../../infrastructure/entity/store-orm.entity';

export class StoreMapper {
  static toResponseDto(store: Store): StoreResponseDto {
    return {
      id_almacen: store.id_almacen!,
      codigo: store.codigo,
      nombre: store.nombre,
      ciudad: store.ciudad,
      direccion: store.direccion,
      telefono: store.telefono,
      activo: store.activo!,
    };
  }

  static toListResponse(stores: Store[]): StoreListResponse {
    return {
      stores: stores.map((store) => this.toResponseDto(store)),
      total: stores.length,
    };
  }

  static fromRegisterDto(dto: RegisterStoreDto): Store {
    return Store.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      ciudad: dto.ciudad,
      direccion: dto.direccion,
      telefono: dto.telefono,
      activo: true,
    });
  }

  static fromUpdateDto(store: Store, dto: UpdateStoreDto): Store {
    return Store.create({
      id_almacen: store.id_almacen,
      codigo: dto.codigo ?? store.codigo,
      nombre: dto.nombre ?? store.nombre,
      ciudad: dto.ciudad ?? store.ciudad,
      direccion: dto.direccion ?? store.direccion,
      telefono: dto.telefono ?? store.telefono,
      activo: store.activo,
    });
  }

  static withStatus(store: Store, activo: boolean): Store {
    return Store.create({
      id_almacen: store.id_almacen,
      codigo: store.codigo,
      nombre: store.nombre,
      ciudad: store.ciudad,
      direccion: store.direccion,
      telefono: store.telefono,
      activo: activo,
    });
  }

  static toDeletedResponse(id_almacen: number): StoreDeletedResponseDto {
    return {
      id_almacen,
      message: 'Almacén eliminado exitosamente',
      deletedAt: new Date(),
    };
  }

  static toDomainEntity(storeOrm: StoreOrmEntity): Store {
    return Store.create({
      id_almacen: storeOrm.id_almacen,
      codigo: storeOrm.codigo,
      nombre: storeOrm.nombre,
      ciudad: storeOrm.ciudad,
      direccion: storeOrm.direccion,
      telefono: storeOrm.telefono,
      activo: storeOrm.activo,
    });
  }

  static toOrmEntity(store: Store): StoreOrmEntity {
    const storeOrm = new StoreOrmEntity();
    if (store.id_almacen) {
      storeOrm.id_almacen = store.id_almacen;
    }
    storeOrm.codigo = store.codigo;
    storeOrm.nombre = store.nombre;
    storeOrm.ciudad = store.ciudad;
    storeOrm.direccion = store.direccion;
    storeOrm.telefono = store.telefono;
    storeOrm.activo = store.activo ?? true;
    return storeOrm;
  }
}