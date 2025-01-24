import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMovimientoDto {
  @IsInt()
  insumoId: number;

  @IsInt()
  depositoId: number;

  @IsString()
  tipo: 'ENTRADA' | 'SALIDA'; // Enum para tipo de movimiento

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  motivo?: string;

  @IsOptional()
  @IsInt()
  referenciaId?: number;

  @IsOptional()
  @IsString()
  referenciaTipo?: string;
}