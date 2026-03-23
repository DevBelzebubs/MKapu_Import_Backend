/* eslint-disable @typescript-eslint/only-throw-error */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuctionCommandService } from '../../../../application/service/auction-command.service';
import { AuctionQueryService } from '../../../../application/service/auction-query.service';
import { CreateAuctionDto } from '../../../../application/dto/in/create-auction.dto';
import { UpdateAuctionDto } from '../../../../application/dto/in/update-auction.dto';
import { ListAuctionFilterDto } from '../../../../application/dto/in/list-auction-filter.dto';
import { AuctionResponseDto } from '../../../../application/dto/out/auction-response.dto';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('auctions')
export class AuctionController {
  constructor(
    private readonly commandService: AuctionCommandService,
    private readonly queryService: AuctionQueryService,
  ) {}

  @Get()
  @Roles('CREAR_REMATES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async list(@Query() filters: ListAuctionFilterDto): Promise<{
    items: AuctionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryService.list(filters);
  }

  @Get(':id')
  @Roles('CREAR_REMATES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AuctionResponseDto> {
    const dto = await this.queryService.findById(id);
    if (!dto)
      throw {
        status: HttpStatus.NOT_FOUND,
        message: `Auction not found: ${id}`,
      };
    return dto;
  }

  @Post()
  @Roles('CREAR_REMATES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async create(@Body() dto: CreateAuctionDto): Promise<AuctionResponseDto> {
    return this.commandService.create(dto);
  }

  @Put(':id')
  @Roles('CREAR_REMATES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuctionDto,
  ): Promise<AuctionResponseDto> {
    return this.commandService.update(id, dto as any);
  }

  @Post(':id/finalize')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_REMATES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async finalize(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AuctionResponseDto> {
    return this.commandService.finalize(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_REMATES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AuctionResponseDto> {
    return this.commandService.cancel(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('CREAR_REMATES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandService.delete(id);
  }
}
