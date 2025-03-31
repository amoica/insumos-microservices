import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductoFabricadoService } from './producto-fabricado.service';
import { CreateProductoFabricadoDto } from './dto/create-producto-fabricado.dto';
import { UpdateProductoFabricadoDto } from './dto/update-producto-fabricado.dto';

@Controller()
export class ProductoFabricadoController {
  constructor(private readonly productoFabricadoService: ProductoFabricadoService) {}

  @MessagePattern({cmd:'createProductoFabricado'})
  create(@Payload() createProductoFabricadoDto: CreateProductoFabricadoDto) {
    return this.productoFabricadoService.create(createProductoFabricadoDto);
  }

  @MessagePattern({cmd:'findAllProductoFabricado'})
  findAll() {
    return this.productoFabricadoService.findAll();
  }

  @MessagePattern({cmd:'findOneProductoFabricado'})
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.productoFabricadoService.findOne(id);
  }

  @MessagePattern('updateProductoFabricado')
  update(@Payload() updateProductoFabricadoDto: UpdateProductoFabricadoDto) {
    return this.productoFabricadoService.update(updateProductoFabricadoDto.id, updateProductoFabricadoDto);
  }

  @MessagePattern('removeProductoFabricado')
  remove(@Payload() id: number) {
    return this.productoFabricadoService.remove(id);
  }
}
