/* ============================================
   administration/src/core/permission/infrastructure/entity/permission-orm.entity.ts
   ============================================ */

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'permiso', schema: 'mkp_administracion' })
export class PermissionOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_permiso' })
  id_permiso: number;

  @Column({ name: 'nombre', type: 'varchar', length: 45, unique: true })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 45, nullable: true })
  descripcion: string;

  @Column({ name: 'activo', type: 'tinyint', width: 1, default: 1 })
  activo: boolean;
}
