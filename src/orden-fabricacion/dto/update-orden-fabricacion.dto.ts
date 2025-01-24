import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenFabricacionDto } from './create-orden-fabricacion.dto';

export class UpdateOrdenFabricacionDto extends PartialType(CreateOrdenFabricacionDto) {
  id: number;
}
