import { IsEnum, IsNumber, IsObject, IsOptional } from 'class-validator';
import { EstadoOrdenFabricacion } from '@prisma/client';
import { SnapshotSkid } from '../types/snapshot-skid.type';
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenFabricacionDto } from './create-orden-fabricacion.dto';

export class UpdateOrdenFabricacionDto extends PartialType(CreateOrdenFabricacionDto){

  @IsNumber()
  id: number

  @IsOptional() @IsEnum(EstadoOrdenFabricacion)
  estado?: EstadoOrdenFabricacion;

  @IsOptional() @IsObject()
  snapshotSkid?: SnapshotSkid | any;

  // opcional: observación de revisión
  @IsOptional()
  revisionObservacion?: string;

  // negocio: requerido sólo al aprobar
  @IsOptional()
  depositoId?: number;
}
