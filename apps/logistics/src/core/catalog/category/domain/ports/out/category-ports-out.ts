/* ============================================
   logistics/src/core/catalog/category/domain/ports/out/category-port-out.ts
   ============================================ */

import { Category } from '../../entity/category-domain-entity';

export interface ICategoryRepositoryPort {
  save(category: Category): Promise<Category>;

  update(category: Category): Promise<Category>;

  delete(id: number): Promise<void>;

  findById(id: number): Promise<Category | null>;

  findByName(nombre: string): Promise<Category | null>;

  findAll(filters?: { activo?: boolean; search?: string }): Promise<Category[]>;

  existsByName(nombre: string): Promise<boolean>;
}