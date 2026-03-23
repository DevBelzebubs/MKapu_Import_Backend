/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CommissionCommandService } from '../../../../application/service/commission-command.service';
import { CommissionQueryService } from '../../../../application/service/commission-query.service';
import { CreateCommissionRuleDto } from '../../../../application/dto/in/create-commission-rule.dto';
import { CommissionTargetType } from '../../../../domain/entity/commission-rule.entity';

import { RoleGuard, Roles } from '@app/common';
import { JwtAuthGuard } from '@app/common/infrastructure/guard/jwt-auth.guard';

@ApiTags('Comisiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('commissions')
export class CommissionController {
  constructor(
    private readonly commandService: CommissionCommandService,
    private readonly queryService: CommissionQueryService,
  ) {}

  @Post('rules/product')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear regla de comisión por producto' })
  async createProductRule(@Body() dto: CreateCommissionRuleDto) {
    return this.commandService.createRule({
      ...dto,
      tipo_objetivo: CommissionTargetType.PRODUCTO,
    });
  }

  @Post('rules/category')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear regla de comisión por categoría' })
  async createCategoryRule(@Body() dto: CreateCommissionRuleDto) {
    return this.commandService.createRule({
      ...dto,
      tipo_objetivo: CommissionTargetType.CATEGORIA,
    });
  }

  @Get('rules')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR', 'ADMINISTRACION')
  @ApiOperation({ summary: 'Listar todas las reglas de comisión' })
  async listRules() {
    return this.queryService.getAllRules();
  }

  @Put('rules/:id')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar regla de comisión' })
  async updateRule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommissionRuleDto,
  ) {
    return await this.commandService.updateRule(id, dto);
  }

  @Patch('rules/:id/status')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Activar o desactivar una regla' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.commandService.toggleStatus(id, isActive);
  }

  // ───────────────────────── REPORTES ─────────────────────────

  @Get('report')
  @Roles('VER_REPORTES', 'ADMINISTRADOR', 'ADMINISTRACION')
  @ApiOperation({ summary: 'Obtener reporte de comisiones' })
  async getReport(@Query('from') from: string, @Query('to') to: string) {
    this.validateDates(from, to);
    return await this.queryService.getReport(new Date(from), new Date(to));
  }

  @Get('calculate')
  @Roles('VER_REPORTES', 'ADMINISTRADOR', 'ADMINISTRACION')
  @ApiOperation({ summary: 'Calcular comisiones en un rango de fechas' })
  async calculateReport(@Query('from') from: string, @Query('to') to: string) {
    this.validateDates(from, to);
    return this.queryService.calculateCommissions(new Date(from), new Date(to));
  }

  @Get('usage-by-rule')
  @Roles('VER_REPORTES', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Uso de reglas de comisión' })
  async getUsageByRule() {
    return await this.queryService.getUsageByRule();
  }

  // ───────────────────────── ACCIONES ─────────────────────────

  @Patch(':id/atender')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Liquidar comisión' })
  async atender(@Param('id', ParseIntPipe) id: number) {
    const c = await this.commandService.atenderCommission(id);

    return {
      id_comision: c.id_comision,
      id_vendedor_ref: c.id_vendedor_ref,
      id_comprobante: c.id_comprobante,
      porcentaje: c.porcentaje,
      monto: c.monto,
      estado: c.estado,
      fecha_registro: c.fecha_registro,
      fecha_liquidacion: c.fecha_liquidacion,
      id_regla: c.id_regla,
    };
  }

  // ───────────────────────── HELPERS ─────────────────────────

  private validateDates(from: string, to: string): void {
    if (!from || !to) {
      throw new BadRequestException('Debes enviar las fechas "from" y "to"');
    }

    const start = new Date(from);
    const end = new Date(to);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException(
        'Formato de fecha inválido. Usa ISO (YYYY-MM-DD)',
      );
    }
  }
}
