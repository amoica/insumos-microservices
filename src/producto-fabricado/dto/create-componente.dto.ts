import { IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateComponenteDto {
  @IsInt()
  insumoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  unidad: string;
}