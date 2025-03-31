import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { CreateContactoDto } from 'src/contacto/dto/create-contacto.dto';


export class CreateClienteDto {
  @IsString()
  public nombre: string;

  @IsString()
  public email: string;

  @IsString()
  public telefono: string;

  @IsOptional()
  @IsString()
  public celular?: string;

  @IsOptional()
  @IsString()
  public direccion?: string;

  @IsOptional()
  @IsString()
  public ciudad?: string;

  @IsOptional()
  @IsString()
  public provincia?: string;

  @IsOptional()
  @IsString()
  public codigoPostal?: string;

  @IsOptional()
  @IsString()
  public cuit?: string;

  @IsOptional()
  @IsString()
  public condicionFiscal?: string;

  @IsOptional()
  @IsString()
  public tipoCliente?: string;

  @IsOptional()
  @IsString()
  public observaciones?: string;

  // ARREGLO de contactos en la misma creación
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactoDto)
  public contactos?: CreateContactoDto[];
}