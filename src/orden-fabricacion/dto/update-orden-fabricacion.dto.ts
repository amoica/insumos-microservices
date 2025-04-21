import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenFabricacionDto } from './create-orden-fabricacion.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateOrdenFabricacionDto extends PartialType(CreateOrdenFabricacionDto) {

  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  revisionObservacion?: string;
}
