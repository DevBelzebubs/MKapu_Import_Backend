import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Inject,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  IStoreCommandPort,
  IStoreQueryPort,
} from '../../../../domain/ports/in/store-port-in';
import {
  ChangeStoreStatusDto,
  ListStoreFilterDto,
  RegisterStoreDto,
  UpdateStoreDto,
} from '../../../../application/dto/in';
import {
  StoreDeletedResponseDto,
  StoreListResponse,
  StoreResponseDto,
} from '../../../../application/dto/out';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('stores')
export class StoreRestController {
  constructor(
    @Inject('IStoreQueryPort')
    private readonly storeQueryService: IStoreQueryPort,
    @Inject('IStoreCommandPort')
    private readonly storeCommandService: IStoreCommandPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('CREAR_ALMACEN', 'ADMINISTRADOR', 'ADMINISTRACION')
  async registerStore(
    @Body() registerDto: RegisterStoreDto,
  ): Promise<StoreResponseDto> {
    return this.storeCommandService.registerStore(registerDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_ALMACEN', 'ADMINISTRADOR', 'ADMINISTRACION')
  async updateStore(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Omit<UpdateStoreDto, 'id_almacen'>,
  ): Promise<StoreResponseDto> {
    const fullUpdateDto: UpdateStoreDto = {
      ...updateDto,
      id_almacen: id,
    };
    return this.storeCommandService.updateStore(fullUpdateDto);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_ALMACEN', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeStoreStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: { activo: boolean },
  ): Promise<StoreResponseDto> {
    const changeStatusDto: ChangeStoreStatusDto = {
      id_almacen: id,
      activo: statusDto.activo,
    };
    return this.storeCommandService.changeStoreStatus(changeStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_ALMACEN', 'ADMINISTRADOR', 'ADMINISTRACION')
  async deleteStore(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StoreDeletedResponseDto> {
    return this.storeCommandService.deleteStore(id);
  }

  @Get(':id')
  @Roles(
    'CREAR_ALMACEN',
    'VER_MOVIMIENTOS',
    'CREAR_MOV_INVENTARIO',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getStore(@Param('id', ParseIntPipe) id: number) {
    return this.storeQueryService.getStoreById(id);
  }

  @Get()
  @Roles(
    'CREAR_ALMACEN',
    'VER_MOVIMIENTOS',
    'CREAR_MOV_INVENTARIO',
    'CREAR_VENTA',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async listStores(
    @Query() filters: ListStoreFilterDto,
  ): Promise<StoreListResponse> {
    return this.storeQueryService.listStores(filters);
  }
}
