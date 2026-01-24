/* ============================================
   logistics/src/core/catalog/category/application/dto/in/update-category-dto.ts
   ============================================ */

export interface UpdateCategoryDto {
  id_categoria: number;
  nombre?: string;
  descripcion?: string;
}