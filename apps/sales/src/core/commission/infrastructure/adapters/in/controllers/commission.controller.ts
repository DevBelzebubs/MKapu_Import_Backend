import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
    dto.tipo_objetivo = CommissionTargetType.PRODUCTO;
    return this.commandService.createRule(dto);
  }

  @Post('rules/category')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear regla de comisión por categoría' })
  async createCategoryRule(@Body() dto: CreateCommissionRuleDto) {
    dto.tipo_objetivo = CommissionTargetType.CATEGORIA;
    return this.commandService.createRule(dto);
  }

  @Get('rules')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR', 'ADMINISTRACION')
  @ApiOperation({ summary: 'Listar todas las reglas de comisión' })
  async listRules() {
    return this.queryService.getAllRules();
  }

  @Patch('rules/:id/status')
  @Roles('CREAR_COMISIONES', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Activar o desactivar una regla de comisión' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.commandService.toggleStatus(id, isActive);
  }

  @Get('calculate')
  @Roles('VER_REPORTES', 'ADMINISTRADOR', 'ADMINISTRACION')
  @ApiOperation({
    summary: 'Calcular el reporte de comisiones en un rango de fechas',
  })
  async calculateReport(@Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) {
      throw new BadRequestException('Debes enviar las fechas "from" y "to"');
    }
    const startDate = new Date(from);
    const endDate = new Date(to);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Formato de fecha inválido. Usa ISO (YYYY-MM-DD)',
      );
    }

    return this.queryService.calculateCommissions(startDate, endDate);
  }
}
