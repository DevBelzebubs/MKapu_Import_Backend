/* ============================================
   logistics/src/core/catalog/category/application/dto/out/category-list-response.ts
   ============================================ */

import { CategoryResponseDto } from './category-response-dto';

export interface CategoryListResponse {
  categories: CategoryResponseDto[];
  total: number;
}
