/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

import { CarrierOrmEntity } from '../../infrastructure/entity/carrier-orm.entity';
import { DriverOrmEntity } from '../../infrastructure/entity/driver-orm.entity';
import { RemissionDetailOrmEntity } from '../../infrastructure/entity/remission-detail-orm.entity';
import { RemissionOrmEntity } from '../../infrastructure/entity/remission-orm.entity';
import { GuideTransferOrm } from '../../infrastructure/entity/transport_guide-orm.entity';
import { VehiculoOrmEntity } from '../../infrastructure/entity/vehicle-orm.entity';
import { InventoryMovementOrmEntity } from 'apps/logistics/src/core/warehouse/inventory/infrastructure/entity/inventory-movement-orm.entity';
import { InventoryMovementDetailOrmEntity } from 'apps/logistics/src/core/warehouse/inventory/infrastructure/entity/inventory-movement-detail-orm.entity';

import { CreateRemissionDto } from '../dto/in/create-remission.dto';
import {
  RemissionStatus,
  TransportMode,
} from '../../domain/entity/remission-domain-entity';
import { RemissionPortIn } from '../../domain/ports/in/remission-port-in';

@Injectable()
export class RemissionCommandService implements RemissionPortIn {
  constructor(
    @Inject('SALES_SERVICE') private readonly salesClient: ClientProxy,
    private readonly dataSource: DataSource,
  ) {}

  async createRemission(dto: CreateRemissionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. VALIDACIÓN TCP AL MICROSERVICIO DE VENTAS
      const saleResponse = await firstValueFrom(
        this.salesClient.send({ cmd: 'verify_sale' }, dto.id_comprobante_ref),
      ).catch(() => null);

      if (!saleResponse || !saleResponse.success) {
        throw new NotFoundException('Venta no encontrada o inválida (2-A)');
      }

      // Asumimos que Ventas devuelve un array en data.detalles
      const detallesVenta =
        saleResponse.data.details || saleResponse.data.detalles || [];

      // 2. PREPARAR Y GUARDAR LA CABECERA DE LA GUÍA PRIMERO
      const guia = new RemissionOrmEntity();
      guia.serie = 'T001';
      guia.numero = await this.generateCorrelative(queryRunner);
      guia.fecha_emision = new Date();
      guia.fecha_inicio = new Date(dto.fecha_inicio_traslado);
      guia.motivo_traslado = dto.motivo_traslado;
      guia.modalidad = dto.modalidad;
      guia.tipo_guia = dto.tipo_guia;
      guia.peso_total = dto.peso_bruto_total;
      guia.unidad_peso = dto.unidad_peso;
      guia.cantidad = dto.items.reduce((acc, i) => acc + i.cantidad, 0);
      guia.estado = RemissionStatus.EMITIDO;

      guia.id_comprobante_ref = dto.id_comprobante_ref;
      guia.id_usuario_ref = dto.id_usuario;
      guia.id_sede_ref = dto.id_sede_origen;
      guia.id_almacen_origen = dto.id_almacen_origen;

      const savedGuia = await queryRunner.manager.save(guia);

      // 3. VALIDAR DETALLES Y DESCONTAR STOCK
      for (const itemDto of dto.items) {
        // Buscamos el producto probando ambos estilos de nombre (snake_case y camelCase)
        const itemVenta = detallesVenta.find(
          (d: any) =>
            d.cod_prod === itemDto.cod_prod ||
            d.codProd === itemDto.cod_prod ||
            d.cod_prod_ref === itemDto.cod_prod, // Por si acaso
        );

        if (!itemVenta) {
          // Si entra aquí, es porque 'detallesVenta' no tiene el producto o está vacío
          throw new BadRequestException(
            `El producto ${itemDto.cod_prod} no pertenece a esta venta o el detalle está vacío.`,
          );
        }

        const cantPedida = Number(itemDto.cantidad);
        const cantVendida = Number(itemVenta.cantidad);

        if (cantPedida > cantVendida) {
          throw new BadRequestException(
            `Cantidad excedente para ${itemDto.cod_prod}. Vendido: ${cantVendida}, Solicitado: ${cantPedida}`,
          );
        }
      }

      // 4. REGISTRAR KARDEX (MOVIMIENTOS) - Fuera del bucle for
      const movementHeader = new InventoryMovementOrmEntity();
      movementHeader.originType = 'VENTA';
      movementHeader.refId = dto.id_comprobante_ref;
      movementHeader.refTable = 'guia_remision';
      movementHeader.observation = `Salida por emisión de Guía ${savedGuia.serie}-${savedGuia.numero}`;

      // Mapeamos todos los detalles en un solo movimiento
      movementHeader.details = dto.items.map((itemDto) => {
        const moveDetail = new InventoryMovementDetailOrmEntity();
        moveDetail.productId = itemDto.id_producto;
        moveDetail.warehouseId = dto.id_almacen_origen;
        moveDetail.quantity = itemDto.cantidad;
        moveDetail.type = 'SALIDA';
        return moveDetail;
      });

      await queryRunner.manager.save(movementHeader);

      // 5. REGISTRAR TRASLADO
      const transfer = new GuideTransferOrm();
      transfer.guia = savedGuia;
      transfer.id_guia = savedGuia.id_guia;
      transfer.direccion_origen = dto.datos_traslado.direccion_origen;
      transfer.ubigeo_origen = dto.datos_traslado.ubigeo_origen;
      transfer.direccion_destino = dto.datos_traslado.direccion_destino;
      transfer.ubigeo_destino = dto.datos_traslado.ubigeo_destino;
      await queryRunner.manager.save(transfer);

      // 6. REGISTRAR TRANSPORTE
      if (dto.modalidad === TransportMode.PRIVADO) {
        const driver = new DriverOrmEntity();
        driver.guia = savedGuia;
        driver.id_guia = savedGuia.id_guia;
        driver.nombre_completo = dto.datos_transporte.nombre_completo;
        driver.tipo_documento = dto.datos_transporte.tipo_documento;
        driver.numero_documento = dto.datos_transporte.numero_documento;
        driver.licencia = dto.datos_transporte.licencia;
        await queryRunner.manager.save(driver);

        const vehicle = new VehiculoOrmEntity();
        vehicle.guia = savedGuia;
        vehicle.id_guia = savedGuia.id_guia;
        vehicle.placa = dto.datos_transporte.placa;
        await queryRunner.manager.save(vehicle);
      } else {
        const carrier = new CarrierOrmEntity();
        carrier.guia = savedGuia;
        carrier.id_guia = savedGuia.id_guia;
        carrier.ruc = dto.datos_transporte.ruc;
        carrier.razon_social = dto.datos_transporte.razon_social;
        await queryRunner.manager.save(carrier);
      }

      // 7. REGISTRAR DETALLES DE LA GUÍA
      const detalles = dto.items.map((i) => {
        const det = new RemissionDetailOrmEntity();
        det.guia = savedGuia;
        det.id_guia = savedGuia.id_guia;
        det.id_producto = i.id_producto;
        det.cod_prod = i.cod_prod;
        det.cantidad = i.cantidad;
        det.peso_total = i.peso_total;
        det.peso_unitario = i.peso_total / i.cantidad; // Controlar división entre 0 si es necesario
        return det;
      });
      await queryRunner.manager.save(detalles);

      // 8. NOTIFICAR AL MICROSERVICIO DE VENTAS (Estado Despacho)
      await firstValueFrom(
        this.salesClient.send(
          { cmd: 'update_dispatch_status' },
          { id_venta: dto.id_comprobante_ref, status: 'EN_CAMINO' },
        ),
      );

      // 9. CONFIRMAR TRANSACCIÓN
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Guía generada correctamente',
        id_guia: savedGuia.id_guia,
        serie_numero: `${savedGuia.serie}-${savedGuia.numero}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al generar la guía:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error en el proceso de emisión de guía (4-B)',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async generateCorrelative(queryRunner: any): Promise<number> {
    const last = await queryRunner.manager.find(RemissionOrmEntity, {
      order: { numero: 'DESC' },
      take: 1,
    });
    return last.length > 0 ? last[0].numero + 1 : 1;
  }
}
