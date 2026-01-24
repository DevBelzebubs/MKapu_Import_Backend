/* ============================================
   logistics/src/core/warehouse/store/domain/ports/out/store-port-out.ts
   ============================================ */

import { Store } from '../../entity/store-domain-entity';

export interface IStoreRepositoryPort {
  save(store: Store): Promise<Store>;
  update(store: Store): Promise<Store>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Store | null>;
  findByCode(codigo: string): Promise<Store | null>;
  findAll(filters?: {
    activo?: boolean;
    search?: string;
    ciudad?: string;
  }): Promise<Store[]>;
  existsByCode(codigo: string): Promise<boolean>;
}
