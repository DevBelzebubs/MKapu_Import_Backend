/* ============================================
   logistics/src/core/catalog/category/category.module.ts
   ============================================ */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure - Entity
import { CategoryOrmEntity } from './infrastructure/entity/category-orm.entity';

// Infrastructure - Adapters IN
import { CategoryRestController } from './infrastructure/adapters/in/controllers/category-rest.controller';

// Infrastructure - Adapters OUT
import { CategoryRepository } from './infrastructure/adapters/out/repository/category.repository';

// Application - Services
import { CategoryCommandService } from './application/service/category-comand.service';
import { CategoryQueryService } from './application/service/category.query.service';

@Module({
  imports: [
    // Registrar la entidad ORM
    TypeOrmModule.forFeature([CategoryOrmEntity]),
  ],
  controllers: [
    // Adapter IN - REST Controller
    CategoryRestController,
  ],
  providers: [
    // Adapter OUT - Repository
    {
      provide: 'ICategoryRepositoryPort',
      useClass: CategoryRepository,
    },

    // Application - Command Service
    {
      provide: 'ICategoryCommandPort',
      useClass: CategoryCommandService,
    },

    // Application - Query Service
    {
      provide: 'ICategoryQueryPort',
      useClass: CategoryQueryService,
    },
  ],
  exports: [
    'ICategoryCommandPort',
    'ICategoryQueryPort',
  ],
})
export class CategoryModule {}