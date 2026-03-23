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
  ISupplierCommandPort,
  ISupplierQueryPort,
} from '../../../../domain/ports/in/supplier-ports-in';
import {
  ChangeSupplierStatusDto,
  ListSupplierFilterDto,
  RegisterSupplierDto,
  UpdateSupplierDto,
} from '../../../../application/dto/in';
import {
  SupplierDeletedResponseDto,
  SupplierListResponse,
  SupplierResponseDto,
} from '../../../../application/dto/out';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('suppliers')
export class SupplierRestController {
  constructor(
    @Inject('ISupplierQueryPort')
    private readonly supplierQueryService: ISupplierQueryPort,
    @Inject('ISupplierCommandPort')
    private readonly supplierCommandService: ISupplierCommandPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('CREAR_PROVEEDORES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async registerSupplier(
    @Body() registerDto: RegisterSupplierDto,
  ): Promise<SupplierResponseDto> {
    return this.supplierCommandService.registerSupplier(registerDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_PROVEEDORES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Omit<UpdateSupplierDto, 'id_proveedor'>,
  ): Promise<SupplierResponseDto> {
    const fullUpdateDto: UpdateSupplierDto = {
      ...updateDto,
      id_proveedor: id,
    };
    return this.supplierCommandService.updateSupplier(fullUpdateDto);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_PROVEEDORES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeSupplierStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: { estado: boolean },
  ): Promise<SupplierResponseDto> {
    const changeStatusDto: ChangeSupplierStatusDto = {
      id_proveedor: id,
      estado: statusDto.estado,
    };
    return this.supplierCommandService.changeSupplierStatus(changeStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_PROVEEDORES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async deleteSupplier(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SupplierDeletedResponseDto> {
    return this.supplierCommandService.deleteSupplier(id);
  }

  @Get(':id')
  @Roles('CREAR_PROVEEDORES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.supplierQueryService.getSupplierById(id);
  }

  @Get()
  @Roles('CREAR_PROVEEDORES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async listSuppliers(
    @Query() filters: ListSupplierFilterDto,
  ): Promise<SupplierListResponse> {
    return this.supplierQueryService.listSuppliers(filters);
  }
}
