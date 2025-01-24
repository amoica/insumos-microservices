import { PartialType } from '@nestjs/mapped-types';
import { CreateDepositoDto } from './create-deposito.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateDepositoDto extends PartialType(CreateDepositoDto) {

  @IsNumber()
  @IsPositive()
  id: number;
}
