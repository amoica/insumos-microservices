// dto/create-insumo-proveedor.dto.ts
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInsumoProveedorDto {
  @IsNumber()
  @Type(() => Number)
  proveedorId: number;

  @IsString()
  codigoProveedor: string;

  // Opcional, ya que puede actualizarse en el futuro cuando se generen cotizaciones
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precioUnitario?: number;
}