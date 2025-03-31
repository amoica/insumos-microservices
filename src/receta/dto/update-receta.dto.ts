import { PartialType } from '@nestjs/mapped-types';
import { CreateRecetaDto } from './create-receta.dto';
import { IsNumber } from 'class-validator';

export class UpdateRecetaDto extends PartialType(CreateRecetaDto) {

  @IsNumber()
  id: number;
}
