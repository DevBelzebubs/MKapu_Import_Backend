import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InventoryMovementOrmEntity } from './inventory-movement-orm.entity';
import { ProductOrmEntity } from 'apps/logistics/src/core/catalog/product/infrastructure/entity/product-orm.entity';
import { WarehouseOrmEntity } from '../../../infrastructure/entity/warehouse-orm.entity';

@Entity({ name: 'detalle_movimiento_inventario', schema: 'mkp_logistica' })
export class InventoryMovementDetailOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_detalle_inv' })
  id: number;

  @Column({ name: 'id_movimiento' })
  movementId: number;

  @ManyToOne(() => ProductOrmEntity)
  @JoinColumn({ name: 'id_producto' })
  product: ProductOrmEntity;

  @ManyToOne(() => WarehouseOrmEntity)
  @JoinColumn({ name: 'id_almacen' })
  warehouse: WarehouseOrmEntity;

  @Column({ name: 'cantidad' })
  quantity: number;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: ['INGRESO', 'SALIDA'],
  })
  type: string;

  @ManyToOne(() => InventoryMovementOrmEntity, (m) => m.details)
  @JoinColumn({ name: 'id_movimiento' })
  movement: InventoryMovementOrmEntity;
}
