import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Controller()
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @MessagePattern({ cmd: 'create_proveedor' })
  create(@Payload() createProveedorDto: CreateProveedorDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @MessagePattern({ cmd: 'find_all_proveedores' })
  findAll() {
    return this.proveedorService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_proveedor' })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.proveedorService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_proveedor' })
  update(@Payload() updateProveedorDto: any) {
    console.log("Actualizando desde el microservice", updateProveedorDto);
    return this.proveedorService.update(updateProveedorDto.id, updateProveedorDto);
  }

  @MessagePattern({ cmd: 'remove_proveedor' })
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.proveedorService.remove(id);
  }
}