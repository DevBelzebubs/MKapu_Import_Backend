
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

//modulos
import { CustomerModule } from './core/customer/customer.module';

//orm entities
import { CustomerOrmEntity } from './core/customer/infrastructure/entity/customer-orm.entity';
import { DocumentTypeOrmEntity } from './core/customer/infrastructure/entity/document-type-orm.entity';  // ✅ AGREGAR

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración dinámica de TypeORM para Sales
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('SALES_DB_HOST'),
        port: configService.get<number>('SALES_DB_PORT'),
        username: configService.get('SALES_DB_USERNAME'),
        password: configService.get('SALES_DB_PASSWORD'),
        database: configService.get('SALES_DB_DATABASE'),
        entities: [
          CustomerOrmEntity,
          DocumentTypeOrmEntity,  // ✅ AGREGAR AQUÍ
        ],
        synchronize: configService.get<boolean>('SALES_DB_SYNCHRONIZE') || false,
        logging: configService.get<boolean>('SALES_DB_LOGGING') || false,
        timezone: 'Z',
        
        // Configuraciones adicionales para evitar ECONNRESET
        extra: {
          connectionLimit: 10,
          connectTimeout: 60000,
          acquireTimeout: 60000,
          timeout: 60000,
          keepAlive: true,
          enableKeepAlive: true,
          keepAliveInitialDelay: 300000,
        },
        
        retryAttempts: 3,
        retryDelay: 3000,
        poolSize: 10,
        autoLoadEntities: true, 
      }),
      inject: [ConfigService],
    }),

    CustomerModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}