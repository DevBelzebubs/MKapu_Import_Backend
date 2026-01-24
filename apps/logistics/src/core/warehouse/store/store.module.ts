/* ============================================
   logistics/src/core/warehouse/store/store.module.ts
   ============================================ */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure - Entity
import { StoreOrmEntity } from './infrastructure/entity/store-orm.entity';

// Infrastructure - Adapters IN
import { StoreRestController } from './infrastructure/adapters/in/controllers/store-rest.controller';

// Infrastructure - Adapters OUT
import { StoreRepository } from './infrastructure/adapters/out/repository/store.repository';

// Application - Services
import { StoreCommandService } from './application/service/store-command.service';
import { StoreQueryService } from './application/service/store-query.service';

@Module({
  imports: [
    // Registrar la entidad ORM
    TypeOrmModule.forFeature([StoreOrmEntity]),
  ],
  controllers: [
    // Adapter IN - REST Controller
    StoreRestController,
  ],
  providers: [
    // Adapter OUT - Repository
    {
      provide: 'IStoreRepositoryPort',
      useClass: StoreRepository,
    },

    // Application - Command Service
    {
      provide: 'IStoreCommandPort',
      useClass: StoreCommandService,
    },

    // Application - Query Service
    {
      provide: 'IStoreQueryPort',
      useClass: StoreQueryService,
    },
  ],
  exports: [
    'IStoreCommandPort',
    'IStoreQueryPort',
  ],
})
export class StoreModule {}