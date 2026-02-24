/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import {
  IInventoryMovementCommandPort,
  MovementRequest,
} from '../../domain/ports/in/inventory-movement-ports-in.';
import { CreateInventoryMovementDto } from '../dto/in/create-inventory-movement.dto';
import { IInventoryRepositoryPort } from '../../domain/ports/out/inventory-movement-ports-out';
import { InventoryMapper } from '../mapper/inventory.mapper';
import { DataSource } from 'typeorm';
import { ConteoInventarioDetalleOrmEntity } from '../../infrastructure/entity/inventory-count-detail-orm.entity';
import {
  ConteoEstado,
  ConteoInventarioOrmEntity,
} from '../../infrastructure/entity/inventory-count-orm.entity';
import { StockOrmEntity } from '../../infrastructure/entity/stock-orm-entity';
import {
  ActualizarDetalleConteoDto,
  FinalizarConteoDto,
  IniciarConteoDto,
} from '../dto/in/inventory-count-dto-in';
import { IInventoryCountRepository } from '../../domain/ports/out/inventory-count-port-out';
@Injectable()
export class InventoryCommandService implements IInventoryMovementCommandPort {
  constructor(
    @Inject('IInventoryRepositoryPort')
    private readonly repository: IInventoryRepositoryPort,
    private readonly dataSource: DataSource,
    @Inject('IInventoryCountRepository')
    private readonly countRepository: IInventoryCountRepository,
  ) {}

  async getStockLevel(productId: number, warehouseId: number): Promise<number> {
    const stock = await this.repository.findStock(productId, warehouseId);
    if (!stock) return 0;
    const statusStr = String(stock.status || stock.status || '').toUpperCase();
    const isActive =
      statusStr === '1' || statusStr === 'AVAILABLE' || statusStr === 'ACTIVO';
    return isActive ? stock.quantity : 0;
  }

  async executeMovement(dto: CreateInventoryMovementDto): Promise<void> {
    const movement = InventoryMapper.toDomain(dto);
    await this.repository.saveMovement(movement);
  }

  async registerIncome(dto: MovementRequest): Promise<void> {
    const fullDto: CreateInventoryMovementDto = {
      ...dto,
      originType: dto.originType || 'TRANSFERENCIA',
      items: dto.items.map((item) => ({ ...item, type: 'INGRESO' })),
    };
    await this.executeMovement(fullDto);
  }

  async registerExit(dto: MovementRequest): Promise<void> {
    const fullDto: CreateInventoryMovementDto = {
      ...dto,
      originType: dto.originType || 'TRANSFERENCIA',
      items: dto.items.map((item) => ({ ...item, type: 'SALIDA' })),
    };
    await this.executeMovement(fullDto);
  }

  async iniciarConteoInventario(dto: IniciarConteoDto) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. RELACIÓN CORREGIDA A 'producto'
      const stocksSede = await manager.find(StockOrmEntity, {
        where: { id_sede: String(dto.idSede) }, // Forzamos el tipo String
        relations: ['producto'],
      });

      if (!stocksSede || stocksSede.length === 0) {
        throw new Error('No hay stock registrado en esta sede.');
      }

      // 2. CREACIÓN DE LA CABECERA
      const nuevoConteo = manager.create(ConteoInventarioOrmEntity, {
        codSede: String(dto.idSede), // Forzamos el tipo String para evitar crasheos de DB
        nomSede: dto.nomSede,
        usuarioCreacionRef: dto.idUsuario,
        estado: ConteoEstado.PENDIENTE,
        totalItems: stocksSede.length,
        totalDiferencias: 0,
      });
      const conteoGuardado = await manager.save(nuevoConteo);

      const detalles = stocksSede.map((s) => {
        return manager.create(ConteoInventarioDetalleOrmEntity, {
          conteo: conteoGuardado,
          idProducto: s.id_producto,
          codProd: s.producto.codigo,
          descripcion: s.producto.descripcion,
          uniMed:
            (s.producto as any).uniMed || (s.producto as any).uni_med || 'UND',
          idStock: s.id_stock,
          idAlmacen: s.id_almacen,
          idSedeRef: Number(s.id_sede),
          stockSistema: Number(s.cantidad),
          stockConteo: null,
          diferencia: 0,
          estado: 1,
        });
      });

      await manager.save(detalles);

      return { idConteo: conteoGuardado.idConteo };
    });
  }

  async finalizarConteoInventario(idConteo: number, dto: FinalizarConteoDto) {
    const sobrantesParaIngreso: any[] = [];
    const faltantesParaSalida: any[] = [];
    let usuarioConteo = 0;

    await this.dataSource.transaction(async (manager) => {
      const conteo = await manager.findOne(ConteoInventarioOrmEntity, {
        where: { idConteo },
        relations: ['detalles'],
      });

      if (!conteo) throw new Error('El conteo no existe');
      if (conteo.estado === ConteoEstado.AJUSTADO)
        throw new Error('Este conteo ya fue ajustado anteriormente');

      usuarioConteo = conteo.usuarioCreacionRef;

      if (dto.estado === ConteoEstado.AJUSTADO) {
        if (!dto.data || dto.data.length === 0) {
          throw new Error(
            'Debe enviar el arreglo de productos contados (data).',
          );
        }

        const conteoFisicoMap = new Map(
          dto.data.map((item) => [item.id_detalle, item.stock_conteo]),
        );

        for (const det of conteo.detalles) {
          const stockIngresado = conteoFisicoMap.get(det.idDetalle);

          if (stockIngresado !== undefined) {
            det.stockConteo = stockIngresado;
            const diff = Number(det.stockConteo) - Number(det.stockSistema);
            det.diferencia = diff;
            det.estado = 2;
            await manager.save(det);

            if (diff !== 0) {
              await manager.update(StockOrmEntity, det.idStock, {
                cantidad: det.stockConteo,
              });
              const itemMovimiento = {
                productId: det.idProducto,
                warehouseId: det.idAlmacen,
                sedeId: det.idSedeRef,
                quantity: Math.abs(diff),
              };

              if (diff > 0) sobrantesParaIngreso.push(itemMovimiento);
              if (diff < 0) faltantesParaSalida.push(itemMovimiento);
            }
          }
        }
        conteo.estado = ConteoEstado.AJUSTADO;
      } else {
        conteo.estado = ConteoEstado.ANULADO;
      }

      conteo.fechaFin = new Date();
      conteo.totalDiferencias = dto.total_diferencias || 0;
      conteo.totalItems = dto.total_items || conteo.detalles.length;

      await manager.save(conteo);
    });
    if (sobrantesParaIngreso.length > 0) {
      await this.registerIncome({
        originType: 'AJUSTE',
        refId: idConteo,
        refTable: 'conteo_inventario',
        observation: `Sobrantes de Conteo #${idConteo}`,
        items: sobrantesParaIngreso,
      } as any);
    }

    if (faltantesParaSalida.length > 0) {
      await this.registerExit({
        originType: 'AJUSTE',
        refId: idConteo,
        refTable: 'conteo_inventario',
        observation: `Faltantes de Conteo #${idConteo}`,
        items: faltantesParaSalida,
      } as any);
    }

    return { success: true, message: 'Conteo finalizado y stock ajustado' };
  }

  async registrarConteoFisico(
    idDetalle: number,
    dto: ActualizarDetalleConteoDto,
  ) {
    const repo = this.dataSource.getRepository(
      ConteoInventarioDetalleOrmEntity,
    );
    const detalle = await repo.findOneBy({ idDetalle });

    if (!detalle) throw new Error('Detalle no encontrado');

    detalle.stockConteo = Number(dto.stockConteo);
    detalle.diferencia = detalle.stockConteo - detalle.stockSistema;
    detalle.observacion = dto.observacion;
    detalle.estado = 2;

    return await repo.save(detalle);
  }
}
