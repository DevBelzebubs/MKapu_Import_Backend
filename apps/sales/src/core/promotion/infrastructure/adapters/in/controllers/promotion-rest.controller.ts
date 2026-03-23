import {
  Controller,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Inject,
  ParseIntPipe,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  IPromotionCommandPort,
  IPromotionQueryPort,
} from '../../../../domain/ports/in/promotion-ports-in';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
} from '../../../../application/dto/in';
import { JwtAuthGuard } from '@app/common/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from '@app/common/infrastructure/guard/roles.guard';
import { Roles } from '@app/common/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('promotions')
export class PromotionRestController {
  constructor(
    @Inject('IPromotionCommandPort')
    private readonly commandPort: IPromotionCommandPort,
    @Inject('IPromotionQueryPort')
    private readonly queryPort: IPromotionQueryPort,
  ) {}

  @Post()
  @Roles('CREAR_PROMOCION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async register(@Body() dto: CreatePromotionDto) {
    return await this.commandPort.registerPromotion(dto);
  }

  @Get()
  @Roles('CREAR_PROMOCION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async list(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await this.queryPort.listPromotions(Number(page), Number(limit));
  }

  @Get('active')
  @Roles(
    'CREAR_PROMOCION',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async listActive() {
    return await this.queryPort.getActivePromotions();
  }

  @Get(':id')
  @Roles('CREAR_PROMOCION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.queryPort.getPromotionById(id);
  }

  @Put(':id')
  @Roles('CREAR_PROMOCION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
  ) {
    return await this.commandPort.updatePromotion(id, dto);
  }

  @Patch(':id/status')
  @Roles('CREAR_PROMOCION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { activo: boolean },
  ) {
    return await this.commandPort.changeStatus({
      idPromocion: id,
      activo: body.activo,
    });
  }

  @Delete(':id/hard')
  @Roles('CREAR_PROMOCION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.commandPort.hardDeletePromotion(id);
  }

  @Delete(':id')
  @Roles('CREAR_PROMOCION', 'ADMINISTRADOR', 'ADMINISTRACION')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.commandPort.deletePromotion(id);
  }

  @MessagePattern({ cmd: 'get_promotion_by_id' })
  async getPromotionById(@Payload() payload: { id: number }) {
    try {
      return await this.queryPort.getPromotionById(payload.id);
    } catch {
      return null;
    }
  }

  @MessagePattern({ cmd: 'get_active_promotions' })
  async getActivePromotions() {
    return await this.queryPort.getActivePromotions();
  }
}
