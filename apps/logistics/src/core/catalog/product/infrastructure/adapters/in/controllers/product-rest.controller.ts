/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Req,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { ProductCommandService } from '../../../../application/service/product-command.service';
import { ProductQueryService } from '../../../../application/service/product-query.service';
import {
  RegisterProductDto,
  UpdateProductDto,
  UpdateProductPricesDto,
  ChangeProductStatusDto,
  ListProductFilterDto,
  ListProductStockFilterDto,
  ProductAutocompleteQueryDto,
} from '../../../../application/dto/in';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('products')
export class ProductRestController {
  constructor(
    private readonly commandService: ProductCommandService,
    private readonly queryService: ProductQueryService,
    private readonly productQueryService: ProductQueryService,
  ) {}

  @Post()
  @Roles('CREAR_PRODUCTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async register(@Body() dto: RegisterProductDto) {
    return this.commandService.registerProduct(dto);
  }

  @Put()
  @Roles('CREAR_PRODUCTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async update(@Body() dto: UpdateProductDto) {
    return this.commandService.updateProduct(dto);
  }

  @Put('prices')
  @Roles('CREAR_PRODUCTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async updatePrices(@Body() dto: UpdateProductPricesDto) {
    return this.commandService.updateProductPrices(dto);
  }

  @Put('status')
  @Roles('CREAR_PRODUCTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeStatus(@Body() dto: ChangeProductStatusDto) {
    return this.commandService.changeProductStatus(dto);
  }

  @Delete(':id')
  @Roles('CREAR_PRODUCTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.commandService.deleteProduct(id);
  }

  @Get()
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async list(@Query() filters: ListProductFilterDto) {
    return this.queryService.listProducts(filters);
  }

  @Get('productos_stock')
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async listProductsStock(
    @Req() req: Request,
    @Query('id_sede') id_sede?: string,
    @Query('codigo') codigo?: string,
    @Query('nombre') nombre?: string,
    @Query('id_categoria') id_categoria?: string,
    @Query('categoria') categoria?: string,
    @Query('familia') familia?: string,
    @Query('activo') activo?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    console.log('[productos_stock] req.url:', req.url);
    console.log('[productos_stock] req.query:', req.query);

    const sede = String(id_sede ?? '').trim();
    if (!sede) {
      throw new BadRequestException(
        'id_sede es obligatorio. Ej: ?id_sede=1&page=1&size=10',
      );
    }

    const categoriaNombre = String(categoria ?? familia ?? '').trim();

    const filters: ListProductStockFilterDto = {
      id_sede: sede,
      codigo: codigo?.trim(),
      nombre: nombre?.trim(),
      id_categoria: id_categoria ? parseInt(id_categoria, 10) : undefined,
      categoria: categoriaNombre || undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      size: size ? parseInt(size, 10) : 10,
    };

    return this.queryService.listProductsStock(filters);
  }

  @Get('autocomplete')
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async autocomplete(
    @Query('search') search?: string,
    @Query('id_sede') id_sede?: string,
    @Query('id_categoria') id_categoria?: string,
  ) {
    const dto: ProductAutocompleteQueryDto = {
      search: String(search ?? '').trim(),
      id_sede: Number(id_sede),
      id_categoria: id_categoria ? Number(id_categoria) : undefined,
    };

    if (!dto.search || dto.search.length < 3) {
      throw new BadRequestException('search debe tener mínimo 3 caracteres');
    }
    if (!dto.id_sede || Number.isNaN(dto.id_sede)) {
      throw new BadRequestException('id_sede es obligatorio. Ej: ?id_sede=1');
    }

    return this.queryService.autocompleteProducts(dto);
  }

  @Get('ventas/autocomplete')
  @Roles(
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async autocompleteVentas(
    @Query('search') search?: string,
    @Query('id_sede') id_sede?: string,
    @Query('id_categoria') id_categoria?: string,
  ) {
    if (!id_sede || Number.isNaN(Number(id_sede))) {
      throw new BadRequestException('id_sede es obligatorio. Ej: ?id_sede=1');
    }
    if (!search || search.trim().length < 2) {
      throw new BadRequestException('search debe tener mínimo 2 caracteres');
    }

    const dto: ProductAutocompleteQueryDto = {
      search: search.trim(),
      id_sede: Number(id_sede),
      id_categoria: id_categoria ? Number(id_categoria) : undefined,
    };

    return this.queryService.autocompleteProductsVentas(dto);
  }

  @Get('ventas/stock')
  @Roles(
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async stockVentas(
    @Query('id_sede') id_sede?: string,
    @Query('search') search?: string,
    @Query('id_categoria') id_categoria?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    if (!id_sede || Number.isNaN(Number(id_sede))) {
      throw new BadRequestException('id_sede es obligatorio. Ej: ?id_sede=1');
    }

    const dto: ProductAutocompleteQueryDto = {
      search: search?.trim() ?? '',
      id_sede: Number(id_sede),
      id_categoria: id_categoria ? Number(id_categoria) : undefined,
    };

    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = size ? parseInt(size, 10) : 10;

    return this.queryService.getProductsStockVentas(dto, pageNum, sizeNum);
  }

  @Get(':id_producto/stock')
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async detailWithStock(
    @Param('id_producto', ParseIntPipe) id_producto: number,
    @Query('id_sede') id_sede?: string,
  ) {
    const sede = String(id_sede ?? '').trim();
    if (!sede) {
      throw new BadRequestException('id_sede es obligatorio. Ej: ?id_sede=1');
    }

    return this.queryService.getProductDetailWithStock(
      id_producto,
      Number(sede),
    );
  }

  @Get('code/:codigo/stock')
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async detailWithStockByCode(
    @Param('codigo') codigo: string,
    @Query('id_sede') id_sede?: string,
  ) {
    const sede = String(id_sede ?? '').trim();
    if (!sede) {
      throw new BadRequestException('id_sede es obligatorio. Ej: ?id_sede=1');
    }

    const result = await this.queryService.getProductDetailWithStockByCode(
      codigo,
      Number(sede),
    );

    if (!result) {
      throw new NotFoundException(`Producto no encontrado: ${codigo}`);
    }

    return result;
  }

  @Get('code/:codigo')
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getByCode(@Param('codigo') codigo: string) {
    const product = await this.queryService.getProductByCode(codigo);
    if (!product)
      throw new NotFoundException(`Producto no encontrado: ${codigo}`);
    return product;
  }

  @Get('category/:id_categoria')
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getByCategory(
    @Param('id_categoria', ParseIntPipe) id_categoria: number,
  ) {
    return this.queryService.getProductsByCategory(id_categoria);
  }

  @Get('categorias-con-stock')
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async categoriasConStock(@Query('id_sede') id_sede?: string) {
    if (!id_sede || Number.isNaN(Number(id_sede))) {
      throw new BadRequestException('id_sede es obligatorio. Ej: ?id_sede=1');
    }
    return this.queryService.getCategoriasConStock(Number(id_sede));
  }

  @Get(':id')
  @Roles(
    'CREAR_PRODUCTOS',
    'CREAR_VENTA',
    'CREAR_COTIZACIONES',
    'CREAR_MOV_INVENTARIO',
    'CREAR_TRANSFERENCIA',
    'CREAR_DESPACHO',
    'CREAR_REMISION',
    'CONTEO_INVENTARIO',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getById(@Param('id', ParseIntPipe) id: number) {
    const product = await this.queryService.getProductById(id);
    if (!product) throw new NotFoundException(`Producto no encontrado: ${id}`);
    return product;
  }

  @MessagePattern({ cmd: 'get_products_info_for_remission' })
  async getInfoForRemission(@Payload() ids: string[]) {
    try {
      console.log(
        `[TCP ADMIN] Recibida petición de pesos para ${ids.length} productos`,
      );

      return await this.productQueryService.getProductsWeightsByIds(ids);
    } catch (error) {
      console.error('[TCP ADMIN] Error al procesar pesos:', error.message);
      return [];
    }
  }

  @MessagePattern({ cmd: 'get_products_codigo_by_ids' })
  async getProductsCodigoByIds(@Payload() ids: number[]) {
    try {
      return await this.queryService.getProductsCodigoByIds(ids);
    } catch (error) {
      console.error('[TCP] Error get_products_codigo_by_ids:', error.message);
      return [];
    }
  }
}
