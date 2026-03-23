/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Inject,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ICashboxCommandPort,
  ICashboxQueryPort,
} from '../../../../domain/ports/in/cashbox-ports-in';
import {
  OpenCashboxDto,
  CloseCashboxDto,
} from '../../../../application/dto/in';
import { Response } from 'express';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('cashbox')
export class CashboxController {
  constructor(
    @Inject('ICashboxCommandPort')
    private readonly commandPort: ICashboxCommandPort,
    @Inject('ICashboxQueryPort')
    private readonly queryPort: ICashboxQueryPort,
  ) {}

  @Post('open')
  @Roles('VER_CAJA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async open(@Body() dto: OpenCashboxDto) {
    return await this.commandPort.openCashbox(dto);
  }

  @Patch('close')
  @Roles('VER_CAJA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async close(@Body() dto: CloseCashboxDto) {
    return await this.commandPort.closeCashbox(dto);
  }

  @Get('active/:idSede')
  @Roles('VER_CAJA', 'CREAR_VENTA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getActive(@Param('idSede', ParseIntPipe) idSede: number) {
    return await this.queryPort.findActiveBySede(idSede);
  }

  @Get('resumen/:idSede')
  @Roles('VER_CAJA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getResumen(@Param('idSede', ParseIntPipe) idSede: number) {
    return await this.queryPort.getResumenDia(idSede);
  }

  @Get('resumen/:idSede/export/thermal')
  @Roles('VER_CAJA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async exportThermalResumen(
    @Param('idSede', ParseIntPipe) idSede: number,
    @Res() res: Response,
  ) {
    const buffer = await this.queryPort.exportThermalResumen(idSede);
    (res as any).set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=Resumen-Caja-Sede-${idSede}.pdf`,
      'Content-Length': buffer.length.toString(),
    });
    (res as any).end(buffer);
  }

  @Get('historial/:idSede')
  @Roles('VER_CAJA', 'VER_VENTAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getHistorial(@Param('idSede', ParseIntPipe) idSede: number) {
    return await this.queryPort.getHistorialBySede(idSede);
  }

  @Get(':idCaja/export/thermal')
  @Roles('VER_CAJA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async exportThermalById(
    @Param('idCaja') idCaja: string,
    @Res() res: Response,
  ) {
    const buffer = await this.queryPort.exportThermalById(idCaja);
    (res as any).set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=Resumen-Caja-${idCaja}.pdf`,
      'Content-Length': buffer.length.toString(),
    });
    (res as any).end(buffer);
  }

  @Get(':id')
  @Roles('VER_CAJA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getById(@Param('id') id: string) {
    return await this.queryPort.getById(id);
  }
}
