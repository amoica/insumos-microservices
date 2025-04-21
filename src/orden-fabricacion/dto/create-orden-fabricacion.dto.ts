import { EstadoOrdenFabricacion, Prioridad } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsInt, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class PedidoClienteDto {
    @IsString()
    @IsNotEmpty()
    numero: string;
  
    @IsInt()
    clienteId: number;
  
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    fecha?: Date;
  
    @IsOptional()
    @IsInt()
    contactoId?: number;
  
    @IsOptional()
    @IsString()
    adjunto?: string;
  }

export class CreateOrdenFabricacionDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsInt()
  productoFabricadoId: number;

  @IsInt()
  cantidad: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaEntrega?: Date;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsInt()
  nroPresupuesto?: number;

  @IsNotEmpty()
  prioridad?: Prioridad;

  @IsString()
  @IsNotEmpty()
  yacimiento: string;

  @IsOptional()
  snapshotSkid?: any; // Si deseas validar el JSON, puedes crear un DTO anidado, pero por ahora lo dejamos como any

  // Datos del Pedido del Cliente (opcional)
  @IsOptional()
  pedidoCliente?: PedidoClienteDto;

  @IsOptional()
  estado: EstadoOrdenFabricacion;


}