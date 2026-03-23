import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RegisterWarrantyDto } from '../../../application/dto/in/register-warranty.dto';
import { WarrantyQueryService } from '../../../application/service/warranty-query.service';
import { WarrantyCommandService } from '../../../application/service/warranty-command.service';
import { ListWarrantyFilterDto } from '../../../application/dto/in/list-warranty-filter.dto';
import { UpdateWarrantyDto } from '../../../application/dto/in/update-warranty.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('warranties')
export class WarrantyRestController {
  constructor(
    private readonly commandService: WarrantyCommandService,
    private readonly queryService: WarrantyQueryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('CREAR_RECLAMO', 'CREAR_VENTA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async register(@Body() dto: RegisterWarrantyDto) {
    return await this.commandService.registerWarranty(dto);
  }

  @Put(':id')
  @Roles('CREAR_RECLAMO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarrantyDto,
  ) {
    return this.commandService.updateWarranty(id, dto);
  }

  @Put(':id/status')
  @Roles('CREAR_RECLAMO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      id_estado: number;
      comentario: string;
      id_usuario: string;
      resolutionAction?: 'REFUND' | 'REPLACE';
    },
  ) {
    return this.commandService.changeStatus(
      id,
      body.id_estado,
      body.comentario,
      body.id_usuario,
      body.resolutionAction,
    );
  }

  @Get()
  @Roles('VER_VENTAS', 'CREAR_RECLAMO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async list(@Query() filters: ListWarrantyFilterDto) {
    return this.queryService.listWarranties(filters);
  }

  @Get(':id')
  @Roles('VER_VENTAS', 'CREAR_RECLAMO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.queryService.getWarrantyById(id);
  }

  @Get('receipt/:id_comprobante')
  @Roles('VER_VENTAS', 'CREAR_RECLAMO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getByReceipt(
    @Param('id_comprobante', ParseIntPipe) idComprobante: number,
  ) {
    return this.queryService.getWarrantiesByReceipt(idComprobante);
  }
}
