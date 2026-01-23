/* ============================================
   administration/src/core/permission/permission.module.ts
   ============================================ */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure - Entity
import { PermissionOrmEntity } from './infrastructure/entity/permission-orm.entity';

// Infrastructure - Adapters IN
import { PermissionRestController } from './infrastructure/adapters/in/controllers/permission-rest.controller';

// Infrastructure - Adapters OUT
import { PermissionWebSocketGateway } from './infrastructure/adapters/out/permission-websocket.gateway';
import { PermissionRepository } from './infrastructure/adapters/out/repository/permisision.repository';

// Application - Services
import { PermissionCommandService } from './application/service/permission-command.service';
import { PermissionQueryService } from './application/service/permission-query.service';

@Module({
  imports: [
    // Registrar la entidad ORM
    TypeOrmModule.forFeature([PermissionOrmEntity]),
  ],
  controllers: [
    // Adapter IN - REST Controller
    PermissionRestController,
  ],
  providers: [
    // Adapter OUT - WebSocket Gateway
    PermissionWebSocketGateway,

    // Adapter OUT - Repository
    {
      provide: 'IPermissionRepositoryPort',
      useClass: PermissionRepository,
    },

    // Application - Command Service
    {
      provide: 'IPermissionCommandPort',
      useClass: PermissionCommandService,
    },

    // Application - Query Service
    {
      provide: 'IPermissionQueryPort',
      useClass: PermissionQueryService,
    },
  ],
  exports: [
    'IPermissionCommandPort',
    'IPermissionQueryPort',
    PermissionWebSocketGateway,
  ],
})
export class PermissionModule {}