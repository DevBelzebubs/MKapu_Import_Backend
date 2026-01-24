/* ============================================
   logistics/src/core/catalog/category/infrastructure/adapters/in/controllers/category-rest.controller.ts
   ============================================ */

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
} from '@nestjs/common';
import { ICategoryCommandPort, ICategoryQueryPort } from '../../../../domain/ports/in/category-ports-in';
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
  async registerCategory(
    @Body() registerDto: RegisterCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryCommandService.registerCategory(registerDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
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
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryDeletedResponseDto> {
    return this.categoryCommandService.deleteCategory(id);
  }

  @Get(':id')
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryQueryService.getCategoryById(id);
  }

  @Get()
  async listCategories(
    @Query() filters: ListCategoryFilterDto,
  ): Promise<CategoryListResponse> {
    return this.categoryQueryService.listCategories(filters);
  }
}