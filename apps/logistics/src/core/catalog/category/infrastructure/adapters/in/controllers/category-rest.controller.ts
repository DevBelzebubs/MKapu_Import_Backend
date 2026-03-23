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
  ICategoryCommandPort,
  ICategoryQueryPort,
} from '../../../../domain/ports/in/category-ports-in';
import {
  ChangeCategoryStatusDto,
  ListCategoryFilterDto,
  RegisterCategoryDto,
  UpdateCategoryDto,
} from '../../../../application/dto/in';
import {
  CategoryDeletedResponseDto,
  CategoryListResponse,
  CategoryResponseDto,
} from '../../../../application/dto/out';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('categories')
export class CategoryRestController {
  constructor(
    @Inject('ICategoryQueryPort')
    private readonly categoryQueryService: ICategoryQueryPort,
    @Inject('ICategoryCommandPort')
    private readonly categoryCommandService: ICategoryCommandPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('CREAR_CATEGORIAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async registerCategory(
    @Body() registerDto: RegisterCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryCommandService.registerCategory(registerDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_CATEGORIAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Omit<UpdateCategoryDto, 'id_categoria'>,
  ): Promise<CategoryResponseDto> {
    const fullUpdateDto: UpdateCategoryDto = {
      ...updateDto,
      id_categoria: id,
    };
    return this.categoryCommandService.updateCategory(fullUpdateDto);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_CATEGORIAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeCategoryStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: { activo: boolean },
  ): Promise<CategoryResponseDto> {
    const changeStatusDto: ChangeCategoryStatusDto = {
      id_categoria: id,
      activo: statusDto.activo,
    };
    return this.categoryCommandService.changeCategoryStatus(changeStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('CREAR_CATEGORIAS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryDeletedResponseDto> {
    return this.categoryCommandService.deleteCategory(id);
  }

  @Get(':id')
  @Roles(
    'CREAR_CATEGORIAS',
    'CREAR_PRODUCTOS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryQueryService.getCategoryById(id);
  }

  @Get()
  @Roles(
    'CREAR_CATEGORIAS',
    'CREAR_PRODUCTOS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async listCategories(
    @Query() filters: ListCategoryFilterDto,
  ): Promise<CategoryListResponse> {
    return this.categoryQueryService.listCategories(filters);
  }
}
