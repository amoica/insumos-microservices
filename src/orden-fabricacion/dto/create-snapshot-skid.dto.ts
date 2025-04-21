import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSkidSeccionDto } from './create-skid-seccion.dto';

export class CreateSnapshotSkidDto {
  @IsString()
  potenciaPaneles: string;

  @IsString()
  baterias: string;

  @IsString()
  psv: string;

  @IsArray()
  bombas: string[];

  @IsArray()
  tableros: number[];

  @IsArray()
  instrumentos: number[];

  @IsBoolean()
  tanque: boolean;

  @IsBoolean()
  calibracion: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkidSeccionDto)
  seccionesExtras: CreateSkidSeccionDto[];

  @IsOptional()
  @IsString()
  estadoDestino?: string;
}