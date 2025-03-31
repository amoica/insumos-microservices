import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateDepositoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  ciudad: string; // Ubicación opcional del depósito

  @IsString()
  @IsOptional()
  direccion: string;

  @IsBoolean()
  @IsOptional()
  avaliable: boolean;
}
