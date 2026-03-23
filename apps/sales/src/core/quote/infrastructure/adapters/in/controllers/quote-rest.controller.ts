import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Inject,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  IQuoteCommandPort,
  IQuoteQueryPort,
} from '../../../../domain/ports/in/quote-ports-in';
import { CreateQuoteDto } from '../../../../application/dto/in/create-quote.dto';
import {
  QuoteResponseDto,
  QuotePagedResponseDto,
} from '../../../../application/dto/out/quote-response.dto';
import { QuoteQueryFiltersDto } from '../../../../application/dto/in/quote-query-filters.dto';
import { QuoteQueryService } from '../../../../application/service/quote-query.service';
import { JwtAuthGuard } from '@app/common/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from '@app/common/infrastructure/guard/roles.guard';
import { Roles } from '@app/common/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('quote')
export class QuoteController {
  constructor(
    @Inject('IQuoteCommandPort')
    private readonly commandPort: IQuoteCommandPort,
    @Inject('IQuoteQueryPort')
    private readonly queryPort: IQuoteQueryPort,
    private readonly quoteQueryService: QuoteQueryService,
  ) {}

  @Post()
  @Roles('CREAR_COTIZACIONES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async create(@Body() dto: CreateQuoteDto): Promise<QuoteResponseDto> {
    return await this.commandPort.create(dto);
  }

  @Patch(':id/approve')
  @Roles('CREAR_COTIZACIONES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async approve(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<QuoteResponseDto> {
    return await this.commandPort.approve(id);
  }

  @Patch(':id/status')
  @Roles('CREAR_COTIZACIONES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string },
  ): Promise<QuoteResponseDto> {
    return await this.commandPort.changeStatus(id, body.estado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('CREAR_COTIZACIONES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.commandPort.delete(id);
  }

  @Get('customer/:valor_doc')
  @Roles(
    'CREAR_COTIZACIONES',
    'CREAR_VENTA',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getByCustomer(
    @Param('valor_doc') valor_doc: string,
  ): Promise<QuoteResponseDto[]> {
    return await this.queryPort.getByCustomerDocument(valor_doc);
  }

  @Get()
  @Roles('CREAR_COTIZACIONES', 'VER_VENTAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async listQuotes(
    @Query() filters: QuoteQueryFiltersDto,
  ): Promise<QuotePagedResponseDto> {
    return this.queryPort.findAllPaged(filters);
  }

  @Get(':id/export/pdf')
  @Roles('CREAR_COTIZACIONES', 'VER_VENTAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async exportPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return await this.quoteQueryService.exportPdf(id, res);
  }

  @Get(':id/export/thermal')
  @Roles('CREAR_COTIZACIONES', 'VER_VENTAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async exportThermalVoucher(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    return await this.quoteQueryService.exportThermalVoucher(id, res);
  }

  @Post(':id/send-email')
  @Roles('CREAR_COTIZACIONES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async sendByEmail(@Param('id', ParseIntPipe) id: number) {
    return await this.quoteQueryService.sendByEmail(id);
  }

  @Get('whatsapp/status')
  @Roles('CREAR_COTIZACIONES', 'VER_VENTAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async whatsAppStatus() {
    return this.quoteQueryService.whatsAppStatus();
  }

  @Post(':id/send-whatsapp')
  @Roles('CREAR_COTIZACIONES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async sendByWhatsApp(@Param('id', ParseIntPipe) id: number) {
    return this.quoteQueryService.sendByWhatsApp(id);
  }

  @Get(':id')
  @Roles('CREAR_COTIZACIONES', 'VER_VENTAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<QuoteResponseDto | null> {
    return await this.queryPort.getById(id);
  }
}
