import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryMovementOrmEntity } from './infrastructure/entity/inventory-movement-orm.entity';
import { InventoryMovementDetailOrmEntity } from './infrastructure/entity/inventory-movement-detail-orm.entity';
import { StockOrmEntity } from './infrastructure/entity/stock-orm-entity';
import { WarehouseOrmEntity } from '../infrastructure/entity/warehouse-orm.entity';

import { InventoryCommandService } from './application/service/inventory/inventory-command.service';
import { InventoryTypeOrmRepository } from './infrastructure/adapters/out/repository/inventory-typeorm.repository';
import { InventoryMovementRestController } from './infrastructure/adapters/in/controllers/inventory-rest.controller';
import { ConteoInventarioOrmEntity } from './infrastructure/entity/inventory-count-orm.entity';
import { ConteoInventarioDetalleOrmEntity } from './infrastructure/entity/inventory-count-detail-orm.entity';
import { InventoryCountController } from './infrastructure/adapters/in/controllers/inventory-count.controller';
import { InventoryCountRepository } from './infrastructure/adapters/out/repository/inventory-count.repository';
import { InventoryCountCommandService } from './application/service/count/inventory-count-command.service';
import { InventoryCountQueryService } from './application/service/count/inventory-count-query.service';
import { InventoryQueryService } from './application/service/inventory/inventory-query.service';
import { SedeOrmEntity } from '../../catalog/product/infrastructure/entity/sede-orm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryMovementOrmEntity,
      InventoryMovementDetailOrmEntity,
      ConteoInventarioOrmEntity,
      ConteoInventarioDetalleOrmEntity,
      StockOrmEntity,
      WarehouseOrmEntity,
      SedeOrmEntity,
    ]),
  ],
  controllers: [InventoryMovementRestController, InventoryCountController],
  providers: [
    {
      provide: 'IInventoryMovementCommandPort',
      useClass: InventoryCommandService,
    },
    InventoryCommandService,
    InventoryQueryService,
    InventoryTypeOrmRepository,
    {
      provide: 'IInventoryRepositoryPort',
      useClass: InventoryTypeOrmRepository,
    },
    {
      provide: 'IInventoryCountRepository',
      useClass: InventoryCountRepository,
    },
    InventoryCountCommandService,
    InventoryCountQueryService,
  ],
  exports: [
    InventoryCommandService,
    InventoryQueryService,
    InventoryTypeOrmRepository,
    'IInventoryRepositoryPort',
    'IInventoryCountRepository',
    InventoryCountCommandService,
    InventoryCountQueryService,
  ],
})
export class InventoryModule {}
