import { IsEnum, IsInt, IsString } from 'class-validator';
import { EstadoOrdenFabricacion } from '@prisma/client';


export class UpdateEstadoDto {
  @IsInt()
  id: number;

  @IsEnum(EstadoOrdenFabricacion)
  estado: EstadoOrdenFabricacion; // PENDIENTE, EN_PROCESO, FINALIZADA, CANCELADA
}