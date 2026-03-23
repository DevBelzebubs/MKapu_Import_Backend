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
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';

import {
  CLAIM_COMMAND_PORT,
  CLAIM_QUERY_PORT,
  IClaimCommandPort,
  IClaimQueryPort,
} from '../../../../domain/ports/in/claim-port-in';
import { RegisterClaimDto } from '../../../../application/dto/in/register-claim-dto';
import { ClaimResponseDto } from '../../../../application/dto/out/claim-response-dto';
import { ClaimMapper } from '../../../../application/mapper/claim.mapper';
import { RoleGuard, Roles } from '@app/common';
import { JwtAuthGuard } from '@app/common/infrastructure/guard/jwt-auth.guard';

@ApiTags('Reclamos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('claims')
export class ClaimRestController {
  constructor(
    @Inject(CLAIM_COMMAND_PORT)
    private readonly claimCommand: IClaimCommandPort,
    @Inject(CLAIM_QUERY_PORT) private readonly claimQuery: IClaimQueryPort,
  ) {}

  @Post()
  @Roles('CREAR_RECLAMO')
  @ApiOperation({ summary: 'Registrar un nuevo reclamo' })
  async register(@Body() dto: RegisterClaimDto) {
    return await this.claimCommand.register(dto);
  }

  @Get(':id')
  @Roles('VER_VENTAS', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Obtener detalle de un reclamo' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const claim = await this.claimQuery.getById(id);
    return ClaimMapper.toResponseDto(claim);
  }

  @Get('receipt/:receiptId')
  @Roles('VER_VENTAS', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Listar reclamos por comprobante' })
  async listByReceipt(@Param('receiptId', ParseIntPipe) receiptId: number) {
    return await this.claimQuery.listBySalesReceipt(receiptId);
  }

  @Patch(':id/attend')
  @Roles('ADMINISTRADOR', 'ADMINISTRACION')
  @ApiOperation({ summary: 'Atender un reclamo (Administrativo)' })
  async attend(
    @Param('id', ParseIntPipe) id: number,
    @Body('respuesta') respuesta: string,
  ) {
    return await this.claimCommand.attend(id, respuesta);
  }

  @Patch(':id/resolve')
  @Roles('ADMINISTRADOR', 'ADMINISTRACION')
  @ApiOperation({ summary: 'Resolver un reclamo' })
  async resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: { respuesta: string },
  ): Promise<ClaimResponseDto> {
    return await this.claimCommand.resolve(id, updateDto.respuesta);
  }

  @Get('sede/:sedeId')
  @Roles('VER_VENTAS', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Listar reclamos por sede' })
  @ApiParam({
    name: 'sedeId',
    description: 'ID de la sede del usuario',
    type: 'number',
  })
  async listBySede(@Param('sedeId', ParseIntPipe) sedeId: number) {
    return await this.claimQuery.listBySede(sedeId);
  }

  @Get(':id/pdf')
  @Roles('VER_VENTAS', 'ADMINISTRADOR', 'VER_REPORTES')
  @ApiOperation({ summary: 'Exportar reclamo a PDF' })
  async exportPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buffer = await this.claimQuery.exportPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Reclamo_REC-${id}.pdf`,
      'Content-Length': buffer.length.toString(),
    });
    res.end(buffer);
  }
}
