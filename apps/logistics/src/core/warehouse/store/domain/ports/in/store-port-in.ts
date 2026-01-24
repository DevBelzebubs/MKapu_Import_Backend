
/* ============================================
   logistics/src/core/warehouse/store/domain/ports/in/store-port-in.ts
   ============================================ */

import {
  RegisterStoreDto,
  UpdateStoreDto,
  ChangeStoreStatusDto,
  ListStoreFilterDto,
} from '../../../application/dto/in';

import {
  StoreResponseDto,
  StoreListResponse,
  StoreDeletedResponseDto,
} from '../../../application/dto/out';

export interface IStoreCommandPort {
  registerStore(dto: RegisterStoreDto): Promise<StoreResponseDto>;
  updateStore(dto: UpdateStoreDto): Promise<StoreResponseDto>;
  changeStoreStatus(dto: ChangeStoreStatusDto): Promise<StoreResponseDto>;
  deleteStore(id: number): Promise<StoreDeletedResponseDto>;
}

export interface IStoreQueryPort {
  listStores(filters?: ListStoreFilterDto): Promise<StoreListResponse>;
  getStoreById(id: number): Promise<StoreResponseDto | null>;
  getStoreByCode(codigo: string): Promise<StoreResponseDto | null>;
}
