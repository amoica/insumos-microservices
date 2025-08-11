import { IsInt, IsOptional, IsString, IsEnum, IsDateString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { Prioridad } from '@prisma/client';
import { SnapshotSkid } from '../types/snapshot-skid.type';

class PedidoClienteDto {
  @IsString() numero!: string;
  @IsInt() clienteId!: number;
  @IsInt() contactoId!: number;
  @IsOptional() @IsString() adjunto?: string;
  @IsOptional() @IsDateString() fecha?: string;
}

export class CreateOrdenFabricacionDto {
  @IsString() codigo!: string;
  @IsInt() productoFabricadoId!: number;
  @IsInt() cantidad!: number;

  @IsOptional() @IsDateString() fechaEntrega?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @IsInt() nroPresupuesto?: number;
  @IsOptional() @IsEnum(Prioridad) prioridad?: Prioridad;

  // yacimientoId en schema, pero en tu create usás yacimiento: { connect: { id: ... } }
  @IsInt() yacimiento!: number;

  @ValidateNested() @Type(() => PedidoClienteDto)
  pedidoCliente!: PedidoClienteDto;

  // puede venir como objeto (mejor) o string JSON (lo parseamos en service)
  @IsOptional() @IsObject() snapshotSkid?: SnapshotSkid | any;
}