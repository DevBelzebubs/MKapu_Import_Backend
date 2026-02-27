import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';
import { InventoryCommandService } from '../../../../application/service/inventory/inventory-command.service';
import { CreateInventoryMovementDto } from '../../../../application/dto/in/create-inventory-movement.dto';
import { InventoryQueryService } from '../../../../application/service/inventory/inventory-query.service';

@Controller('inventory-movements')
@UseGuards(RoleGuard)
export class InventoryMovementRestController {
  constructor(
    private readonly commandService: InventoryCommandService,
    private readonly inventoryQueryService: InventoryQueryService,
  ) {}

  @Post('income')
  @Roles('Administrador')
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
  async getMovementsHistory(
    @Query('search') search?: string,
    @Query('tipoId') tipoId?: number,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const filters = { search, tipoId, fechaInicio, fechaFin };
    return await this.inventoryQueryService.getMovementsHistory(filters);
  }
}
