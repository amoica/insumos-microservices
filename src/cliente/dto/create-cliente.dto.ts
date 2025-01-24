import { IsString, IsOptional } from "class-validator";

export class CreateClienteDto {
  // Nombre de la persona o razón social de la empresa
  @IsString()
  public nombre: string;

  // Dirección de correo electrónico de contacto
  @IsString()
  public email: string;

  // Teléfono principal (podría ser fijo o celular)
  @IsString()
  public telefono: string;

  // Número de celular/WhatsApp (si querés diferenciarlo)
  @IsOptional()
  @IsString()
  public celular?: string;

  // Dirección
  @IsOptional()
  @IsString()
  public direccion?: string;

  // Ciudad
  @IsOptional()
  @IsString()
  public ciudad?: string;

  // Provincia
  @IsOptional()
  @IsString()
  public provincia?: string;

  // Código postal
  @IsOptional()
  @IsString()
  public codigoPostal?: string;

  // CUIT (tanto para personas como empresas) o DNI si querés diferenciar
  @IsOptional()
  @IsString()
  public cuit?: string;

  // Situación fiscal (Monotributo, Resp. Inscripto, Consumidor Final, etc.)
  @IsOptional()
  @IsString()
  public condicionFiscal?: string;

  // Tipo de cliente (por ejemplo: "PERSONA_FISICA", "EMPRESA")
  @IsOptional()
  @IsString()
  public tipoCliente?: string;

  // Observaciones o notas internas
  @IsOptional()
  @IsString()
  public observaciones?: string;
}