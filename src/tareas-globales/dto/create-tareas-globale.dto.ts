import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateTareaGlobalDto {
  @IsString()
  public nombre: string;

  @IsString()
  public descripcion: string;

  @IsNumber()
  @Min(0)
  public costoBase: number;
}