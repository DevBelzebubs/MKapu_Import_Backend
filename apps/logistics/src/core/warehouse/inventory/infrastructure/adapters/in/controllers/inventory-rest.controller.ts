/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';
import { InventoryCommandService } from '../../../../application/service/inventory/inventory-command.service';
import { CreateInventoryMovementDto } from '../../../../application/dto/in/create-inventory-movement.dto';
import { InventoryQueryService } from '../../../../application/service/inventory/inventory-query.service';
import { ManualAdjustmentDto } from '../../../../application/dto/in/manual-adjustment.dto';
import { ProductQueryService } from 'apps/logistics/src/core/catalog/product/application/service/product-query.service';
import { BulkManualAdjustmentDto } from 'apps/logistics/src/core/warehouse/application/dto/in/bulk-manual-adjustment.dto';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('inventory-movements')
export class InventoryMovementRestController {
  constructor(
    private readonly commandService: InventoryCommandService,
    private readonly inventoryQueryService: InventoryQueryService,
    @Inject(forwardRef(() => ProductQueryService))
    private readonly productQueryService: ProductQueryService,
  ) {}

  @Post('income')
  @Roles('CREAR_MOV_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  @HttpCode(HttpStatus.CREATED)
  async registerIncome(@Body() dto: CreateInventoryMovementDto) {
    await this.commandService.executeMovement(dto);

    return {
      message: 'Ingreso de mercadería registrado exitosamente',
      data: {
        reference: `${dto.refTable} #${dto.refId}`,
      },
    };
  }

  @Get('movements')
  @Roles(
    'VER_MOVIMIENTOS',
    'CREAR_MOV_INVENTARIO',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getMovementsHistory(
    @Query('search') search?: string,
    @Query('tipoId') tipoId?: number,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('sedeId') sedeId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = {
      search,
      tipoId,
      fechaInicio,
      fechaFin,
      sedeId,
      page,
      limit,
    };
    return await this.inventoryQueryService.getMovementsHistory(filters);
  }

  @Post('adjustment')
  @Roles('CREAR_AJUSTE_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async makeAdjustment(@Body() dto: ManualAdjustmentDto) {
    try {
      await this.commandService.manualAdjustment(dto);
      return { message: 'Ajuste realizado correctamente' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('adjustment/bulk')
  @Roles('CREAR_AJUSTE_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async makeBulkAdjustment(@Body() dto: BulkManualAdjustmentDto) {
    try {
      await this.commandService.bulkManualAdjustment(dto);
      return { message: 'Ajustes masivos realizados correctamente' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('autocomplete')
  @Roles(
    'CREAR_MOV_INVENTARIO',
    'CREAR_AJUSTE_INVENTARIO',
    'CONTEO_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async autocompleteProducts(@Query('codigo') codigo: string) {
    try {
      const products =
        await this.productQueryService.getAutocompleteProducts(codigo);
      return products;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
