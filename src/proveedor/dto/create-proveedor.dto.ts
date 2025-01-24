import { IsString, IsOptional } from "class-validator";

export class CreateProveedorDto {
  // Nombre o razón social del proveedor
  @IsString()
  public nombre: string;

  // Dirección de correo electrónico de contacto
  @IsString()
  public email: string;

  // Teléfono principal (opcional)
  @IsOptional()
  @IsString()
  public telefono?: string;

  // Persona de contacto (opcional)
  @IsOptional()
  @IsString()
  public contacto?: string;

  // Dirección física del proveedor (opcional)
  @IsOptional()
  @IsString()
  public direccion?: string;

  // Ciudad del proveedor (opcional)
  @IsOptional()
  @IsString()
  public ciudad?: string;

  // Provincia del proveedor (opcional)
  @IsOptional()
  @IsString()
  public provincia?: string;

  // Código postal (opcional)
  @IsOptional()
  @IsString()
  public codigoPostal?: string;

  // CUIT o identificación fiscal (opcional)
  @IsOptional()
  @IsString()
  public cuit?: string;

  // Situación fiscal (opcional)
  @IsOptional()
  @IsString()
  public condicionFiscal?: string;

  // Tipo de proveedor (por ejemplo: "SERVICIOS", "PRODUCTOS", etc., opcional)
  @IsOptional()
  @IsString()
  public tipoProveedor?: string;

  // Observaciones o notas internas (opcional)
  @IsOptional()
  @IsString()
  public observaciones?: string;
}