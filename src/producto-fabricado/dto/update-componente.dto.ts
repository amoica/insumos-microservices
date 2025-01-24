import { IsString, IsArray, ValidateNested, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateComponenteDto {
  @IsInt()
  insumoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  unidad: string;
}