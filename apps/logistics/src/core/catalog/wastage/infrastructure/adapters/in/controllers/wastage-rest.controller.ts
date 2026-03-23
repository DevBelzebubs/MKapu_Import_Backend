import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { IWastageCommandPort } from '../../../../domain/ports/in/wastage.port.in';
import { IWastageQueryPort } from '../../../../domain/ports/in/wastage.port.in';
import { CreateWastageDto } from '../../../../application/dto/in/create-wastage.dto';
import {
  WastageResponseDto,
  WastagePaginatedResponseDto,
} from '../../../../application/dto/out/wastage-response.dto';
import { WastageTypeService } from '../../../../application/service/wastage-type.service';
import { WastageTypeResponseDto } from '../../../../application/dto/out/wastage-type-response.dto';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('catalog/wastage')
export class WastageRestController {
  constructor(
    @Inject('IWastageCommandPort')
    private readonly commandPort: IWastageCommandPort,

    @Inject('IWastageQueryPort')
    private readonly queryPort: IWastageQueryPort,

    private readonly wastageTypeService: WastageTypeService,
  ) {}

  @Post()
  @Roles('CREAR_MERMAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async create(@Body() dto: CreateWastageDto): Promise<WastageResponseDto> {
    return await this.commandPort.create(dto);
  }

  @Get('tipos')
  @Roles('CREAR_MERMAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async findTipos(): Promise<WastageTypeResponseDto[]> {
    return await this.wastageTypeService.findAll();
  }

  @Get()
  @Roles('CREAR_MERMAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('id_sede', new DefaultValuePipe(0), ParseIntPipe) id_sede: number,
  ): Promise<WastagePaginatedResponseDto> {
    return await this.queryPort.findAllPaginated(
      page,
      limit,
      id_sede || undefined,
    );
  }

  @Get(':id')
  @Roles('CREAR_MERMAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WastageResponseDto> {
    return await this.queryPort.findById(id);
  }
}
