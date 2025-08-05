import { PartialType } from '@nestjs/mapped-types';
import { CreateYacimientoDto } from './create-yacimiento.dto';

export class UpdateYacimientoDto extends PartialType(CreateYacimientoDto) {
  id: number;
}
