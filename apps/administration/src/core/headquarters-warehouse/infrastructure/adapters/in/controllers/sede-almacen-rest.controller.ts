import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ISedeAlmacenCommandPort,
  ISedeAlmacenQueryPort,
} from '../../../../domain/ports/in/sede-almacen-ports-in';
import { AssignWarehouseToSedeDto } from '../../../../application/dto/in';
import {
  SedeAlmacenListResponseDto,
  SedeAlmacenResponseDto,
} from '../../../../application/dto/out';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('sede-almacen')
export class SedeAlmacenRestController {
  constructor(
    @Inject('ISedeAlmacenCommandPort')
    private readonly commandService: ISedeAlmacenCommandPort,
    @Inject('ISedeAlmacenQueryPort')
    private readonly queryService: ISedeAlmacenQueryPort,
  ) {}

  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  @Roles('CREAR_SEDES', 'CREAR_ALMACEN', 'ADMINISTRADOR', 'ADMINISTRACION')
  async assignWarehouseToSede(
    @Body() dto: AssignWarehouseToSedeDto,
  ): Promise<SedeAlmacenResponseDto> {
    return this.commandService.assignWarehouseToSede(dto);
  }

  @Put(':id_almacen/sede')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_SEDES', 'CREAR_ALMACEN', 'ADMINISTRADOR', 'ADMINISTRACION')
  async reassignWarehouse(
    @Param('id_almacen', ParseIntPipe) id_almacen: number,
    @Body() body: { id_sede: number },
  ): Promise<SedeAlmacenResponseDto> {
    return this.commandService.reassignWarehouseToSede({
      id_almacen,
      id_sede: body.id_sede,
    });
  }

  @Delete(':id_almacen/sede')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('CREAR_SEDES', 'CREAR_ALMACEN', 'ADMINISTRADOR', 'ADMINISTRACION')
  async unassignWarehouse(
    @Param('id_almacen', ParseIntPipe) id_almacen: number,
  ): Promise<void> {
    return this.commandService.unassignWarehouse(id_almacen);
  }

  @Get('sede/:id_sede')
  @Roles(
    'CREAR_SEDES',
    'CREAR_ALMACEN',
    'CREAR_VENTA',
    'VER_VENTAS',
    'CREAR_MOV_INVENTARIO',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async listWarehousesBySede(
    @Param('id_sede', ParseIntPipe) id_sede: number,
  ): Promise<SedeAlmacenListResponseDto> {
    return this.queryService.listWarehousesBySede(id_sede);
  }

  @Get('almacen/:id_almacen')
  @Roles(
    'CREAR_SEDES',
    'CREAR_ALMACEN',
    'CREAR_VENTA',
    'VER_VENTAS',
    'CREAR_MOV_INVENTARIO',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getAssignmentByWarehouse(
    @Param('id_almacen', ParseIntPipe) id_almacen: number,
  ): Promise<SedeAlmacenResponseDto> {
    return this.queryService.getAssignmentByWarehouse(id_almacen);
  }
}
