
/* ============================================
   logistics/src/core/catalog/category/infrastructure/entity/category-orm.entity.ts
   ============================================ */

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { ProductOrmEntity } from '../../../product/infrastructure/entity/product-orm.entity';

@Entity({ name: 'categoria', schema: 'mkp_logistica' })
export class CategoryOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  id_categoria: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50, unique: true })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 50, nullable: true })
  descripcion: string;

  @Column({ name: 'activo', type: 'bit', width: 1, default: 1 })
  activo: boolean;

  // Relación inversa con productos (cuando crees el módulo Product)
  // @OneToMany(() => ProductOrmEntity, (product) => product.category)
  // products?: ProductOrmEntity[];
}