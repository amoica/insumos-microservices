import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductoFabricadoService } from './producto-fabricado.service';
import { CreateProductoFabricadoDto } from './dto/create-producto-fabricado.dto';
import { UpdateProductoFabricadoDto } from './dto/update-producto-fabricado.dto';

@Controller()
export class ProductoFabricadoController {
  constructor(private readonly productosFabricadosService: ProductoFabricadoService) {}

  @MessagePattern({ cmd: 'create_producto_fabricado' })
  create(@Payload() createProductoFabricadoDto: CreateProductoFabricadoDto) {
    return this.productosFabricadosService.create(createProductoFabricadoDto);
  }

  @MessagePattern({ cmd: 'find_all_productos_fabricados' })
  findAll() {
    return this.productosFabricadosService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_producto_fabricado' })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.productosFabricadosService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_producto_fabricado' })
  update(@Payload() updateProductoFabricadoDto: UpdateProductoFabricadoDto) {
    return this.productosFabricadosService.update(updateProductoFabricadoDto);
  }

  @MessagePattern({ cmd: 'remove_producto_fabricado' })
  remove(@Payload() id: number) {
    return this.productosFabricadosService.remove(id);
  }
}