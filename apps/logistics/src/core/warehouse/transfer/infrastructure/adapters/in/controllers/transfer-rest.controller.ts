import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import type { TransferResponseDto } from '../../../../application/dto/out/transfer-response.dto';
import { TransferResponseMapper } from '../../../../application/mapper/transfer-response.mapper';
import { TransferPortsIn } from '../../../../domain/ports/in/transfer-ports-in';
import { ApproveTransferDto } from '../../../../application/dto/in/approve-transfer.dto';
import { ConfirmReceiptTransferDto } from '../../../../application/dto/in/confirm-receipt-transfer.dto';
import { ListTransferNotificationQueryDto } from '../../../../application/dto/in/list-transfer-notification-query.dto';
import { ListTransferQueryDto } from '../../../../application/dto/in/list-transfer-query.dto';
import { RejectTransferDto } from '../../../../application/dto/in/reject-transfer.dto';
import { RequestTransferDto } from '../../../../application/dto/in/request-transfer.dto';
import {
  TransferByIdResponseDto,
  TransferListPaginatedResponseDto,
  TransferNotificationResponseDto,
} from '../../../../application/dto/out';
import { TransferRequestMapper } from '../../../../application/mapper/transfer-request.mapper';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('warehouse/transfer')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TransferRestController {
  constructor(
    @Inject('TransferPortsIn')
    private readonly transferService: TransferPortsIn,
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @Roles('CREAR_TRANSFERENCIA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async requestTransfer(
    @Body() dto: RequestTransferDto,
    @Headers('x-transfer-mode') transferModeHeader?: string,
  ): Promise<TransferResponseDto> {
    const transfer = await this.transferService.requestTransfer(
      TransferRequestMapper.withTransferMode(dto, transferModeHeader),
    );

    return TransferResponseMapper.toResponseDto(transfer);
  }

  @Patch(':id/approve')
  @Roles('CREAR_TRANSFERENCIA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async approveTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveTransferDto,
  ): Promise<TransferResponseDto> {
    const transfer = await this.transferService.approveTransfer(id, dto);
    return TransferResponseMapper.toResponseDto(transfer);
  }

  @Patch(':id/reject')
  @Roles('CREAR_TRANSFERENCIA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async rejectTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectTransferDto,
  ): Promise<TransferResponseDto> {
    const transfer = await this.transferService.rejectTransfer(id, dto);
    return TransferResponseMapper.toResponseDto(transfer);
  }

  @Patch(':id/confirm-receipt')
  @Roles('CREAR_TRANSFERENCIA', 'ADMINISTRADOR', 'ADMINISTRACION')
  async confirmReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmReceiptTransferDto,
  ): Promise<TransferResponseDto> {
    const transfer = await this.transferService.confirmReceipt(id, dto);
    return TransferResponseMapper.toResponseDto(transfer);
  }

  @Get('headquarters/:hqId')
  @Roles(
    'CREAR_TRANSFERENCIA',
    'VER_MOVIMIENTOS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getTransfersByHeadquarters(
    @Param('hqId') hqId: string,
  ): Promise<TransferResponseDto[]> {
    const transfers =
      await this.transferService.getTransfersByHeadquarters(hqId);
    return transfers.map((transfer) =>
      TransferResponseMapper.toResponseDto(transfer),
    );
  }

  @Get()
  @Roles(
    'CREAR_TRANSFERENCIA',
    'VER_MOVIMIENTOS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getAllTransfers(
    @Query() query: ListTransferQueryDto,
  ): Promise<TransferListPaginatedResponseDto> {
    return await this.transferService.getAllTransfers(query);
  }

  @Get('notifications')
  @Roles(
    'CREAR_TRANSFERENCIA',
    'VER_MOVIMIENTOS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getTransferNotifications(
    @Query() query: ListTransferNotificationQueryDto,
  ): Promise<TransferNotificationResponseDto[]> {
    return await this.transferService.getTransferNotifications(query);
  }

  @Get(':id')
  @Roles(
    'CREAR_TRANSFERENCIA',
    'VER_MOVIMIENTOS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getTransferById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransferByIdResponseDto> {
    return await this.transferService.getTransferById(id);
  }
}
