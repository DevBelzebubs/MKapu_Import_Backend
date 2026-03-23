import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IDispatchInputPort } from '../../../../domain/ports/in/dispatch-input.port';
import { IDispatchQueryPort } from '../../../../application/service/dispatch-query.service';
import {
  CancelarDespachoDto,
  ConfirmarEntregaDto,
  CreateDispatchDto,
  IniciarTransitoDto,
  MarcarDetallePreparadoDto,
} from '../../../../application/dto/in/dispatch-input.dto';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('despachos')
export class DispatchRestController {
  constructor(
    @Inject('IDispatchInputPort')
    private readonly commandService: IDispatchInputPort,
    @Inject('IDispatchQueryPort')
    private readonly queryService: IDispatchQueryPort,
  ) {}

  @Get()
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  findAll() {
    return this.queryService.findAll();
  }

  @Get('venta/:id_venta')
  @Roles('CREAR_DESPACHO', 'VER_VENTAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  findByVenta(@Param('id_venta', ParseIntPipe) id_venta: number) {
    return this.queryService.findByVenta(id_venta);
  }

  @Get(':id')
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.queryService.findById(id);
  }

  @Post()
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  crear(@Body() dto: CreateDispatchDto) {
    return this.commandService.crearDespacho(dto);
  }

  @Patch(':id/preparacion')
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  iniciarPreparacion(@Param('id', ParseIntPipe) id: number) {
    return this.commandService.iniciarPreparacion({ id_despacho: id });
  }

  @Patch(':id/transito')
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  iniciarTransito(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: IniciarTransitoDto,
  ) {
    return this.commandService.iniciarTransito({ ...dto, id_despacho: id });
  }

  @Patch(':id/entrega')
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  confirmarEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmarEntregaDto,
  ) {
    return this.commandService.confirmarEntrega({ ...dto, id_despacho: id });
  }

  @Patch(':id/cancelar')
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelarDespachoDto,
  ) {
    return this.commandService.cancelarDespacho({ ...dto, id_despacho: id });
  }

  @Patch('detalle/:id/preparado')
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  marcarDetallePreparado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarcarDetallePreparadoDto,
  ) {
    return this.commandService.marcarDetallePreparado({
      ...dto,
      id_detalle_despacho: id,
    });
  }

  @Patch('detalle/:id/despachado')
  @Roles('CREAR_DESPACHO', 'ADMINISTRADOR', 'ADMINISTRACION')
  marcarDetalleDespachado(@Param('id', ParseIntPipe) id: number) {
    return this.commandService.marcarDetalleDespachado({
      id_detalle_despacho: id,
    });
  }
}
