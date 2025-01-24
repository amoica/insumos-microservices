import { IsInt, IsPositive, IsString, IsOptional } from 'class-validator';

export class UpdateStockDto {
  @IsInt()
  @IsPositive()
  insumoId: number;

  @IsInt()
  @IsPositive()
  depositoId: number;

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsString()
  @IsOptional()
  motivo?: string; // Ejemplo: "Entrada", "Salida", "Reserva"
}