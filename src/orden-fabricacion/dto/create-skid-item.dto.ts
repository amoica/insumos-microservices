import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateSkidItemDto {
  @IsInt()
  insumoId: number;

  @IsInt()
  cantidad: number;
}