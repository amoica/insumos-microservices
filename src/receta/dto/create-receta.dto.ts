import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateComponenteInsumoDto } from "./create-componente-insumo.dto";


export class CreateRecetaDto {


  @IsOptional()
  @IsNumber()
  version?: number;

  @IsOptional()
  @IsBoolean()
  esActiva?: boolean;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComponenteInsumoDto)
  componentes: CreateComponenteInsumoDto[];
}
