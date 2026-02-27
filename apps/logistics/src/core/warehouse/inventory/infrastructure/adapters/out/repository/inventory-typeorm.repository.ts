/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInventoryRepositoryPort } from '../../../../domain/ports/out/inventory-movement-ports-out';
import { InventoryMovement } from '../../../../domain/entity/inventory-movement.entity';
import { Stock } from '../../../../domain/entity/stock-domain-entity';
import { InventoryMovementOrmEntity } from '../../../entity/inventory-movement-orm.entity';
import { StockOrmEntity } from '../../../entity/stock-orm-entity';
import { InventoryMovementResponseDto } from '../../../../application/dto/out/inventory-movement-response.dto';

@Injectable()
export class InventoryTypeOrmRepository implements IInventoryRepositoryPort {
  constructor(
    @InjectRepository(InventoryMovementOrmEntity)
    private readonly movementRepo: Repository<InventoryMovementOrmEntity>,
    @InjectRepository(StockOrmEntity)
    private readonly stockRepo: Repository<StockOrmEntity>,
  ) {}

  async saveMovement(movement: InventoryMovement): Promise<void> {
    const movementOrm = this.movementRepo.create({
      originType: movement.originType,
      refId: movement.refId,
      refTable: movement.refTable,
      observation: movement.observation,
      date: movement.date,
      details: movement.items.map((item) => ({
        productId: item.productId,
        warehouseId: item.warehouseId,
        quantity: item.quantity,
        type: item.type,
      })),
    });

    await this.movementRepo.save(movementOrm);
  }

  async findStock(
    productId: number,
    warehouseId: number,
  ): Promise<Stock | null> {
    const stockOrm = await this.stockRepo.findOne({
      where: { id_producto: productId, id_almacen: warehouseId },
    });

    if (!stockOrm) return null;

    return new Stock(
      stockOrm.id_stock,
      stockOrm.id_producto,
      stockOrm.id_almacen,
      stockOrm.id_sede,
      stockOrm.cantidad,
      stockOrm.tipo_ubicacion,
      stockOrm.estado,
    );
  }

  async updateStock(stock: Stock): Promise<void> {
    await this.stockRepo.update(stock.id, { cantidad: stock.quantity });
  }

  async findAllMovements(filters: any) {
    const query = this.movementRepo
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .leftJoinAndSelect('details.warehouse', 'warehouse')
      .leftJoinAndSelect('warehouse.sede', 'sede')
      .orderBy('movement.date', 'DESC');

    // --- FILTROS ---
    if (filters.search) {
      query.andWhere(
        '(movement.observation LIKE :search OR movement.refTable LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.tipoId && filters.tipoId > 0) {
      if (filters.tipoId == 1) {
        query.andWhere('details.type = :type', { type: 'INGRESO' });
      } else if (filters.tipoId == 2) {
        query.andWhere('details.type = :type', { type: 'SALIDA' });
      } else if (filters.tipoId == 3) {
        query.andWhere('movement.originType = :otype', {
          otype: 'TRANSFERENCIA',
        });
      }
    }

    if (filters.fechaInicio && filters.fechaFin) {
      query.andWhere('movement.date BETWEEN :inicio AND :fin', {
        inicio: filters.fechaInicio,
        fin: filters.fechaFin,
      });
    }

    const [movements, total] = await query.getManyAndCount();

    const mappedData: InventoryMovementResponseDto[] = movements.map((mov) => {
      // 1. Extraemos los almacenes basándonos en el TIPO de detalle
      const detalleSalida = mov.details.find((d) => d.type === 'SALIDA');
      const detalleIngreso = mov.details.find((d) => d.type === 'INGRESO');

      const whSalidaNombre = detalleSalida?.warehouse?.nombre;
      const whIngresoNombre = detalleIngreso?.warehouse?.nombre;

      // 2. Lógica inteligente para Origen y Destino según el tipo de origen
      let origenNombre = 'N/A';
      let destinoNombre = 'N/A';

      switch (mov.originType) {
        case 'TRANSFERENCIA':
          origenNombre = whSalidaNombre || 'Desconocido';
          destinoNombre = whIngresoNombre || 'En Tránsito';
          break;
        case 'COMPRA':
          origenNombre = 'Proveedor (Extermo)';
          destinoNombre = whIngresoNombre || 'N/A';
          break;
        case 'VENTA':
          origenNombre = whSalidaNombre || 'N/A';
          destinoNombre = 'Cliente (Externo)';
          break;
        case 'AJUSTE':
          // En un ajuste puede ser que entró stock (sobrante) o salió (pérdida)
          origenNombre = whSalidaNombre ? whSalidaNombre : 'Ajuste Manual';
          destinoNombre = whIngresoNombre ? whIngresoNombre : 'Ajuste Manual';
          break;
      }

      // 3. Sede (Tomamos la sede del almacén involucrado válido)
      const sedeNombre =
        detalleSalida?.warehouse?.sede?.nombre ||
        detalleIngreso?.warehouse?.sede?.nombre ||
        'Sin Sede';

      const detallesUnicos = [];
      const mapProductos = new Map();

      mov.details.forEach((det) => {
        if (!mapProductos.has(det.product?.id_producto)) {
          mapProductos.set(det.product?.id_producto, true);
          detallesUnicos.push({
            id: det.id,
            productoNombre:
              det.product?.descripcion ||
              det.product?.codigo ||
              `ID: ${det.product?.id_producto}`,
            cantidad: det.quantity,
            unidadMedida: det.product?.uni_med || 'UND',
            tipoOperacionItem: det.type,
          });
        }
      });

      return {
        id: mov.id,
        tipoMovimiento: mov.originType,
        fechaMovimiento: mov.date,
        motivo: mov.observation || 'Sin observación',
        documentoReferencia: mov.refTable
          ? `${mov.refTable} #${mov.refId}`
          : 'N/A',
        usuario: 'Sistema', // Si más adelante agregas 'createdBy', lo pones aquí
        almacenOrigenNombre: origenNombre,
        almacenDestinoNombre: destinoNombre,
        sedeNombre: sedeNombre,
        detalles: detallesUnicos, // Enviamos la lista sin duplicados
      };
    });

    return { data: mappedData, total };
  }
}
