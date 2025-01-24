import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdenFabricacionService } from './orden-fabricacion.service';
import { CreateOrdenFabricacionDto } from './dto/create-orden-fabricacion.dto';
import { UpdateOrdenFabricacionDto } from './dto/update-orden-fabricacion.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { EstadoOrdenFabricacion } from '@prisma/client';

@Controller()
export class OrdenFabricacionController {
  constructor(private readonly ordenFabricacionService: OrdenFabricacionService) {}

  @MessagePattern({cmd: 'createOrdenFabricacion'})
  create(@Payload() createOrdenFabricacionDto: CreateOrdenFabricacionDto) {
    return this.ordenFabricacionService.create(createOrdenFabricacionDto);
  }

  @MessagePattern({cmd: 'findAllOrdenesFabricacion'})
  findAll() {
    return this.ordenFabricacionService.findAll();
  }

  @MessagePattern({cmd: 'findOrdenFabricacionByEstado'})
  findByEstado(@Payload('estado') estado: EstadoOrdenFabricacion) {
    return this.ordenFabricacionService.findByEstado(estado);
  }

  @MessagePattern({cmd: 'updateEstadoOrdenFabricacion'})
  updateEstado(@Payload() updateEstadoDto: UpdateEstadoDto) {
    return this.ordenFabricacionService.updateEstado(updateEstadoDto);
  }
}
