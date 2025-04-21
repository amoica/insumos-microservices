import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSkidItemDto } from './create-skid-item.dto';

export class CreateSkidSeccionDto {
  @IsString()
  tipo: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsInt()
  baseComponenteId?: number;

  @IsOptional()
  @IsString()
  codigoComponente?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkidItemDto)
  items: CreateSkidItemDto[];
}