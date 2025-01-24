import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsArray, ValidateNested, IsOptional, IsInt, Min } from 'class-validator';
import { CreateProductoFabricadoDto } from './create-producto-fabricado.dto';
import { UpdateComponenteDto } from './update-componente.dto';
import { Type } from 'class-transformer';

export class UpdateProductoFabricadoDto extends PartialType(CreateProductoFabricadoDto) {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateComponenteDto)
  componentes?: UpdateComponenteDto[];
}
