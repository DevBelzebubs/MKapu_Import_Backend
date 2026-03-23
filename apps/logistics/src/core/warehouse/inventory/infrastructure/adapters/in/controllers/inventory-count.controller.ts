/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { InventoryCountCommandService } from '../../../../application/service/count/inventory-count-command.service';
import { InventoryCountQueryService } from '../../../../application/service/count/inventory-count-query.service';

import {
  ActualizarDetalleConteoDto,
  FinalizarConteoDto,
  IniciarConteoDto,
} from '../../../../application/dto/in/inventory-count-dto-in';
import { ListInventoryCountFilterDto } from '../../../../application/dto/in/list-inventory-count-filter.dto';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('conteo-inventario')
export class InventoryCountController {
  constructor(
    private readonly countCommandService: InventoryCountCommandService,
    private readonly countQueryService: InventoryCountQueryService,
  ) {}

  @Post()
  @Roles('CONTEO_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async iniciar(@Body() dto: IniciarConteoDto) {
    return await this.countCommandService.initInventoryCount(dto);
  }

  @Get()
  @Roles('CONTEO_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async listarConteos(@Query() filter: ListInventoryCountFilterDto) {
    return await this.countQueryService.listarConteosPorSede(filter);
  }

  @Patch('detalle/:idDetalle')
  @Roles('CONTEO_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async actualizarDetalle(
    @Param('idDetalle') idDetalle: number,
    @Body() dto: ActualizarDetalleConteoDto,
  ) {
    return await this.countCommandService.registerPhysicCount(idDetalle, dto);
  }

  @Patch(':idConteo/finalizar')
  @Roles('CONTEO_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async finalizar(
    @Param('idConteo') idConteo: number,
    @Body() dto: FinalizarConteoDto,
  ) {
    return await this.countCommandService.endInventoryCount(idConteo, dto);
  }

  @Get(':idConteo')
  @Roles('CONTEO_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async obtenerDetalle(@Param('idConteo') idConteo: number) {
    return await this.countQueryService.obtenerConteoConDetalles(idConteo);
  }

  @Get(':id/exportar/excel')
  @Roles('CONTEO_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async exportarExcel(@Param('id') id: number, @Res() res: Response) {
    try {
      const buffer = await this.countQueryService.exportarConteoExcel(id);

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Conteo_Inventario_${id}.xlsx`,
        'Content-Length': buffer.byteLength.toString(),
      });

      res.end(buffer);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  @Get(':id/exportar/pdf')
  @Roles('CONTEO_INVENTARIO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async exportarPdf(@Param('id') id: number, @Res() res: Response) {
    try {
      const buffer = await this.countQueryService.exportarConteoPdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Conteo_Inventario_${id}.pdf`,
        'Content-Length': buffer.byteLength.toString(),
      });

      res.end(buffer);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
