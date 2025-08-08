import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenFabricacionDto } from './create-orden-fabricacion.dto';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EstadoOrdenFabricacion } from '@prisma/client';

export class UpdateOrdenFabricacionDto extends PartialType(CreateOrdenFabricacionDto) {

  @IsInt()
  id: number;

  @IsOptional()
  snapshotSkid?: any;

  @IsOptional()
  @IsString()
  revisionObservacion?: string;

  @IsOptional()
  @IsEnum(EstadoOrdenFabricacion)
  estado?: EstadoOrdenFabricacion;

  // Solo requerido si vas a aprobar
  @IsOptional()
  @IsInt()
  depositoId?: number;
}
