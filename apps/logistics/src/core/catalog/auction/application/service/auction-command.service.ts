import { Injectable, Inject, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { IAuctionCommandPort } from '../../domain/port/in/auction.port.in';
import { IAuctionRepositoryPort } from '../../domain/port/out/auction.port.out';
import { CreateAuctionDto } from '../dto/in/create-auction.dto';
import { Auction } from '../../domain/entity/auction-domain-entity';
import { AuctionMapper } from '../mapper/auction.mapper';
import { AuctionResponseDto } from '../dto/out/auction-response.dto';
import { InventoryCommandService } from '../../../../warehouse/inventory/application/service/inventory-command.service';
import { MovementRequest } from '../../../../warehouse/inventory/domain/ports/in/inventory-movement-ports-in.';

@Injectable()
export class AuctionCommandService implements IAuctionCommandPort {
  private readonly logger = new Logger(AuctionCommandService.name);

  constructor(
    @Inject('IAuctionRepositoryPort')
    private readonly repository: IAuctionRepositoryPort,
    private readonly inventoryService: InventoryCommandService,
  ) {}

  /**
   * Crea una subasta (remate), valida stock y registra la salida en inventario.
   * Si el registro en inventario falla, intenta compensar eliminando la subasta creada.
   */
  async create(dto: CreateAuctionDto): Promise<AuctionResponseDto> {
    // Validaciones básicas
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('Se requiere al menos un detalle para crear la subasta.');
    }
    if (!dto.id_almacen_ref || dto.id_almacen_ref <= 0) {
      throw new BadRequestException('Se requiere id_almacen_ref válido para descontar stock.');
    }

    // Validar stock para cada detalle
    for (const item of dto.detalles) {
      const stockDisponible = await this.inventoryService.getStockLevel(
        item.id_producto,
        dto.id_almacen_ref,
      );
      if (!stockDisponible || stockDisponible < item.stock_remate) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ID ${item.id_producto}. ` +
          `Disponible: ${stockDisponible || 0}, Requerido: ${item.stock_remate}`,
        );
      }
    }

    // Construir entidad de dominio
    const domain = new Auction(
      dto.cod_remate,
      dto.descripcion,
      new Date(dto.fec_fin),
      undefined, // startAt se asigna por defecto en el ctor
      dto.estado as any,
      undefined,
      dto.detalles.map(d => ({
        productId: d.id_producto,
        originalPrice: d.pre_original,
        auctionPrice: d.pre_remate,
        auctionStock: d.stock_remate,
        observacion: (d as any).observacion,
      })),
    );

    // Regla de negocio: fec_fin > fec_inicio
    if (domain.endAt.getTime() <= domain.startAt.getTime()) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio.');
    }

    // Persistir subasta
    const saved = await this.repository.save(domain);

    // Preparar payload para inventario: usamos originType = 'AJUSTE' (valor permitido)
    const exitPayload: MovementRequest = {
      originType: 'AJUSTE' as MovementRequest['originType'],
      refId: saved.id!,
      refTable: 'remate',
      observation: `Remate registrado: ${dto.cod_remate}`,
      items: dto.detalles.map((d) => ({
        productId: d.id_producto,
        warehouseId: dto.id_almacen_ref,
        quantity: d.stock_remate,
      })),
    };

    // Registrar salida en inventario y compensar si falla
    try {
      await this.inventoryService.registerExit(exitPayload);
    } catch (err) {
      this.logger.error(`Error registrando salida en inventario para remate id=${saved.id}`, err);
      // Compensación simple: eliminar la subasta recién creada
      try {
        await this.repository.delete(saved.id!);
      } catch (delErr) {
        this.logger.error(`Error intentando compensar borrando remate id=${saved.id}`, delErr);
      }
      throw new InternalServerErrorException('Error al registrar salida en inventario. Operación revertida.');
    }

    return AuctionMapper.toResponseDto(saved);
  }

  /**
   * Actualiza una subasta.
   * Nota: no ajusta inventario automáticamente cuando se modifican cantidades/almacén.
   * Si necesitas esa lógica, implementaremos diff + entradas/saldos.
   */
  async update(id: number, dto: CreateAuctionDto): Promise<AuctionResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new BadRequestException('Subasta no encontrada.');

    // Mapear cambios sobre el dominio existente
    const domain = existing;
    domain.code = dto.cod_remate;
    domain.description = dto.descripcion;
    domain.endAt = new Date(dto.fec_fin);
    domain.details = dto.detalles.map(d => ({
      productId: d.id_producto,
      originalPrice: d.pre_original,
      auctionPrice: d.pre_remate,
      auctionStock: d.stock_remate,
      observacion: (d as any).observacion,
    }));

    // Validación simple de fechas
    if (domain.endAt.getTime() <= domain.startAt.getTime()) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio.');
    }

    // Persistir cambios
    const saved = await this.repository.save(domain);
    return AuctionMapper.toResponseDto(saved);
  }

  /**
   * Finaliza (cierra) una subasta.
   */
  async finalize(id: number): Promise<AuctionResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new BadRequestException('Subasta no encontrada.');
    existing.finalize();
    const saved = await this.repository.save(existing);
    return AuctionMapper.toResponseDto(saved);
  }

  /**
   * Elimina una subasta.
   * Nota: no revierte movimientos de inventario; si es necesario, implementa compensación adicional.
   */
  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}