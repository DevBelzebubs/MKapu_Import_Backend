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
} from '@nestjs/common';
import { InventoryCommandService } from '../../../../application/service/inventory-command.service';
import {
  ActualizarDetalleConteoDto,
  FinalizarConteoDto,
  IniciarConteoDto,
} from '../../../../application/dto/in/inventory-count-dto-in';
import { Response } from 'express';
import { InventoryQueryService } from '../../../../application/service/inventory-query.service';
import { ListInventoryCountFilterDto } from '../../../../application/dto/in/list-inventory-count-filter.dto';

@Controller('conteo-inventario')
export class InventoryCountController {
  constructor(
    private readonly inventoryService: InventoryCommandService,
    private readonly inventoryQueryService: InventoryQueryService,
  ) {}

  @Post()
  async iniciar(@Body() dto: IniciarConteoDto) {
    return await this.inventoryService.iniciarConteoInventario(dto);
  }
  @Get()
  async listarConteos(@Query() filter: ListInventoryCountFilterDto) {
    return await this.inventoryQueryService.listarConteosPorSede(filter);
  }
  @Patch('detalle/:idDetalle')
  async actualizarDetalle(
    @Param('idDetalle') idDetalle: number,
    @Body() dto: ActualizarDetalleConteoDto,
  ) {
    return await this.inventoryService.registrarConteoFisico(idDetalle, dto);
  }

  @Patch(':idConteo/finalizar')
  async finalizar(
    @Param('idConteo') idConteo: number,
    @Body() dto: FinalizarConteoDto,
  ) {
    return await this.inventoryService.finalizarConteoInventario(idConteo, dto);
  }

  @Get(':idConteo')
  async obtenerDetalle(@Param('idConteo') idConteo: number) {
    return await this.inventoryQueryService.obtenerConteoConDetalles(idConteo);
  }
  @Get(':id/exportar/excel')
  async exportarExcel(@Param('id') id: number, @Res() res: Response) {
    try {
      const buffer = await this.inventoryQueryService.exportarConteoExcel(id);
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Conteo_Inventario_${id}.xlsx`,
        'Content-Length': buffer.byteLength,
      });

      // Enviamos el archivo al cliente
      res.end(buffer);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  @Get(':id/exportar/pdf')
  async exportarPdf(@Param('id') id: number, @Res() res: Response) {
    try {
      const buffer = await this.inventoryQueryService.exportarConteoPdf(id);

      // Cabeceras para PDF
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Conteo_Inventario_${id}.pdf`,
        'Content-Length': buffer.byteLength,
      });

      res.end(buffer);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
