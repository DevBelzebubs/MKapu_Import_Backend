import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { IBankQueryPort } from '../../../../domain/ports/in/bank-ports-in';
import {
  BankResponseDto,
  ServiceTypeResponseDto,
} from '../../../../application/dto/out';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('banks')
export class BankRestController {
  constructor(
    @Inject('IBankQueryPort')
    private readonly bankQueryService: IBankQueryPort,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(
    'CREAR_VENTA',
    'VER_VENTAS',
    'CREAR_COTIZACIONES',
    'VER_CAJA',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getAllBanks(): Promise<BankResponseDto[]> {
    return this.bankQueryService.getAllBanks();
  }

  @Get('service-types')
  @HttpCode(HttpStatus.OK)
  @Roles(
    'CREAR_VENTA',
    'VER_VENTAS',
    'CREAR_COTIZACIONES',
    'VER_CAJA',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getServiceTypes(
    @Query('bancoId') bancoId?: string,
  ): Promise<ServiceTypeResponseDto[]> {
    return this.bankQueryService.getServiceTypes(
      bancoId ? Number(bancoId) : undefined,
    );
  }
}
