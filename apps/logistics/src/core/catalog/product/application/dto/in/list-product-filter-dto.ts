import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListProductFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  estado?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_categoria?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 5;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  id_sede: number;
}
