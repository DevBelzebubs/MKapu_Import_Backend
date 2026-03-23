import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  IDiscountCommandPort,
  IDiscountQueryPort,
} from '../../../../domain/ports/in/discount-ports-in';
import {
  CreateDiscountDto,
  UpdateDiscountDto,
} from '../../../../application/dto/in';
import { JwtAuthGuard } from '@app/common/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from '@app/common/infrastructure/guard/roles.guard';
import { Roles } from '@app/common/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('discounts')
export class DiscountRestController {
  constructor(
    @Inject('IDiscountCommandPort')
    private readonly commandPort: IDiscountCommandPort,
    @Inject('IDiscountQueryPort')
    private readonly queryPort: IDiscountQueryPort,
  ) {}

  @Post()
  @Roles('CREAR_DESCUENTO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async create(@Body() dto: CreateDiscountDto) {
    return await this.commandPort.createDiscount(dto);
  }

  @Get()
  @Roles('CREAR_DESCUENTO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async list(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await this.queryPort.listDiscounts(Number(page), Number(limit));
  }

  @Get('active')
  @Roles(
    'CREAR_DESCUENTO',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async listActive() {
    return await this.queryPort.listActiveDiscounts();
  }

  @Get(':id')
  @Roles('CREAR_DESCUENTO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.queryPort.getDiscountById(id);
  }

  @Put(':id')
  @Roles('CREAR_DESCUENTO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ) {
    return await this.commandPort.updateDiscount(id, dto);
  }

  @Put(':id/status')
  @Roles('CREAR_DESCUENTO', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return await this.commandPort.changeStatus(id, activo);
  }
}
