import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDepositoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  ciudad: string; // Ubicación opcional del depósito

  @IsString()
  @IsOptional()
  direccion: string;
}
