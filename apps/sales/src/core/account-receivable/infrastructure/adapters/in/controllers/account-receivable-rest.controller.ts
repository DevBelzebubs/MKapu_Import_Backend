import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AccountReceivableCommandService } from '../../../../application/service/command/account-receivable-command.service';
import { AccountReceivableQueryService } from '../../../../application/service/query/account-receivable-query.service';
import { AccountReceivableMapper } from '../../../../application/mapper/account-receivable.mapper';
import {
  CreateAccountReceivableDto,
  ApplyPaymentDto,
  CancelAccountReceivableDto,
  UpdateDueDateDto,
  PaginationDto,
} from '../../../../application/dto/in/account-receivable-dto-in';
import {
  AccountReceivableResponseDto,
  AccountReceivablePaginatedResponseDto,
} from '../../../../application/dto/out/account-receivable-dto-out';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('account-receivables')
export class AccountReceivableRestController {
  constructor(
    private readonly commandService: AccountReceivableCommandService,
    private readonly queryService: AccountReceivableQueryService,
    private readonly mapper: AccountReceivableMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('CREAR_VENTA_POR_COBRAR', 'ADMINISTRADOR', 'ADMINISTRACION')
  async create(
    @Body() dto: CreateAccountReceivableDto,
  ): Promise<AccountReceivableResponseDto> {
    const domain = await this.commandService.create({
      salesReceiptId: dto.salesReceiptId,
      userRef: dto.userRef,
      totalAmount: dto.totalAmount,
      dueDate: dto.dueDate,
      paymentTypeId: dto.paymentTypeId,
      currencyCode: dto.currencyCode,
      observation: dto.observation,
    });
    return this.mapper.toResponseDto(domain);
  }

  @Get()
  @Roles(
    'VER_VENTAS',
    'CREAR_VENTA_POR_COBRAR',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async findAllOpen(
    @Query() pagination: PaginationDto,
  ): Promise<AccountReceivablePaginatedResponseDto> {
    const result = await this.queryService.getAllOpen({
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 10,
      sedeId: pagination.sedeId ?? undefined,
      status: pagination.status ?? undefined,
    });
    return {
      data: this.mapper.toResponseDtoList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('whatsapp/status')
  @Roles(
    'VER_VENTAS',
    'CREAR_VENTA_POR_COBRAR',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async whatsAppStatus() {
    return this.queryService.whatsAppStatus();
  }

  @Get(':id/export/pdf')
  @Roles(
    'VER_VENTAS',
    'CREAR_VENTA_POR_COBRAR',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async exportPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return await this.queryService.exportPdf(id, res);
  }

  @Post(':id/send-email')
  @Roles('CREAR_VENTA_POR_COBRAR', 'ADMINISTRADOR', 'ADMINISTRACION')
  async sendByEmail(@Param('id', ParseIntPipe) id: number) {
    return await this.queryService.sendByEmail(id);
  }

  @Post(':id/send-whatsapp')
  @Roles('CREAR_VENTA_POR_COBRAR', 'ADMINISTRADOR', 'ADMINISTRACION')
  async sendByWhatsApp(@Param('id', ParseIntPipe) id: number) {
    return await this.queryService.sendByWhatsApp(id);
  }

  @Get(':id/export/thermal')
  @Roles(
    'VER_VENTAS',
    'CREAR_VENTA_POR_COBRAR',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async exportThermalVoucher(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    return await this.queryService.exportThermalVoucher(id, res);
  }

  @Get(':id')
  @Roles(
    'VER_VENTAS',
    'CREAR_VENTA_POR_COBRAR',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AccountReceivableResponseDto> {
    const domain = await this.queryService.getById(id);
    return this.mapper.toResponseDto(domain);
  }

  @Patch('payment')
  @Roles('CREAR_VENTA_POR_COBRAR', 'ADMINISTRADOR', 'ADMINISTRACION')
  async applyPayment(
    @Body() dto: ApplyPaymentDto,
  ): Promise<AccountReceivableResponseDto> {
    const domain = await this.commandService.applyPayment({
      accountReceivableId: dto.accountReceivableId,
      amount: dto.amount,
      currencyCode: dto.currencyCode,
      paymentTypeId: dto.paymentTypeId,
    });
    return this.mapper.toResponseDto(domain);
  }

  @Patch('cancel')
  @Roles('CREAR_VENTA_POR_COBRAR', 'ADMINISTRADOR', 'ADMINISTRACION')
  async cancel(
    @Body() dto: CancelAccountReceivableDto,
  ): Promise<AccountReceivableResponseDto> {
    const domain = await this.commandService.cancel({
      accountReceivableId: dto.accountReceivableId,
      reason: dto.reason,
    });
    return this.mapper.toResponseDto(domain);
  }

  @Patch('due-date')
  @Roles('CREAR_VENTA_POR_COBRAR', 'ADMINISTRADOR', 'ADMINISTRACION')
  async updateDueDate(
    @Body() dto: UpdateDueDateDto,
  ): Promise<AccountReceivableResponseDto> {
    const domain = await this.commandService.updateDueDate({
      accountReceivableId: dto.accountReceivableId,
      newDueDate: dto.newDueDate,
    });
    return this.mapper.toResponseDto(domain);
  }
}
