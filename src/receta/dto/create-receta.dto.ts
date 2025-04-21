import { Transform, Type } from "class-transformer";
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
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  })
  tipo: string;

  @IsString()
  @IsOptional()
  imagenUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComponenteInsumoDto)
  componentes: CreateComponenteInsumoDto[];
}
