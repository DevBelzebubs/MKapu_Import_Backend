/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { RemissionCommandService } from '../../../../application/service/remission-command.service';
import { CreateRemissionDto } from '../../../../application/dto/in/create-remission.dto';
import { JwtAuthGuard } from '@app/common/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from '@app/common/infrastructure/guard/roles.guard';
import { Roles } from '@app/common';
import { ListRemissionFilterDto } from '../../../../application/dto/in/list-remission-filter.dto';
import { RemissionQueryService } from '../../../../application/service/remission-query.service';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('remission')
export class RemissionController {
  constructor(
    private readonly service: RemissionCommandService,
    private readonly remissionQueryService: RemissionQueryService,
  ) {}

  @Post()
  @Roles('CREAR_REMISION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async create(@Body() dto: CreateRemissionDto) {
    return await this.service.createRemission(dto);
  }

  @Get('sale/:correlativo')
  @Roles('CREAR_REMISION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async findSale(@Param('correlativo') correlativo: string) {
    return await this.service.searchSaleToForward(correlativo);
  }

  @Get()
  @Roles('CREAR_REMISION', 'VER_MOVIMIENTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async findAll(@Query() filter: ListRemissionFilterDto) {
    return await this.remissionQueryService.executeList(filter);
  }

  @Get('summary')
  @Roles('CREAR_REMISION', 'VER_MOVIMIENTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getSummary() {
    return await this.remissionQueryService.executeGetSummary();
  }

  @Get(':id')
  @Roles('CREAR_REMISION', 'VER_MOVIMIENTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async findOne(@Param('id') id: string) {
    return await this.remissionQueryService.executeFindById(id);
  }

  @Get(':id/export/excel')
  @Roles('CREAR_REMISION', 'VER_MOVIMIENTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async exportExcel(@Param('id') id: string, @Res() res: Response) {
    return await this.remissionQueryService.exportExcel(id, res);
  }

  @Get(':id/export/pdf')
  @Roles('CREAR_REMISION', 'VER_MOVIMIENTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    return await this.remissionQueryService.exportPdf(id, res);
  }
}
