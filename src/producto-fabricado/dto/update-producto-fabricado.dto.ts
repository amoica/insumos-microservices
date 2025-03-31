import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoFabricadoDto } from './create-producto-fabricado.dto';

export class UpdateProductoFabricadoDto extends PartialType(CreateProductoFabricadoDto) {
  id: number;
}
