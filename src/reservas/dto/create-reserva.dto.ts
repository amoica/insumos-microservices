import { IsInt, IsString, Min } from 'class-validator';

export class CreateReservaDto {
  @IsInt()
  insumoId: number;

  @IsInt()
  depositoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  referenciaTipo: string; // Ejemplo: "OrdenFabricacion"

  @IsInt()
  referenciaId: number; // ID de la referencia
}
