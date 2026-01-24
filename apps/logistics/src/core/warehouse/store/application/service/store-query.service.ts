
/* ============================================
   logistics/src/core/warehouse/store/application/service/store-query.service.ts
   ============================================ */

import { Inject, Injectable } from '@nestjs/common';
import { IStoreQueryPort } from '../../domain/ports/in/store-port-in';
import { IStoreRepositoryPort } from '../../domain/ports/out/store-port-out';
import { ListStoreFilterDto } from '../dto/in';
import { StoreResponseDto, StoreListResponse } from '../dto/out';
import { StoreMapper } from '../mapper/store.mapper';

@Injectable()
export class StoreQueryService implements IStoreQueryPort {
  constructor(
    @Inject('IStoreRepositoryPort')
    private readonly repository: IStoreRepositoryPort,
  ) {}

  async listStores(filters?: ListStoreFilterDto): Promise<StoreListResponse> {
    const stores = await this.repository.findAll(filters);
    return StoreMapper.toListResponse(stores);
  }

  async getStoreById(id: number): Promise<StoreResponseDto | null> {
    const store = await this.repository.findById(id);
    if (!store) {
      return null;
    }
    return StoreMapper.toResponseDto(store);
  }

  async getStoreByCode(codigo: string): Promise<StoreResponseDto | null> {
    const store = await this.repository.findByCode(codigo);
    if (!store) {
      return null;
    }
    return StoreMapper.toResponseDto(store);
  }
}

