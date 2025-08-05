// src/yacimiento/yacimiento.controller.ts
import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { YacimientoService } from './yacimiento.service';
import { CreateYacimientoDto } from './dto/create-yacimiento.dto';
import { UpdateYacimientoDto } from './dto/update-yacimiento.dto';

@Controller()
export class YacimientoController {
  constructor(private readonly yacimientoService: YacimientoService) {}

  @MessagePattern({ cmd: 'create_yacimiento' })
  create(@Payload() dto: CreateYacimientoDto) {
    return this.yacimientoService.create(dto);
  }

  @MessagePattern({ cmd: 'find_all_yacimientos' })
  findAll() {
    return this.yacimientoService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_yacimiento' })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.yacimientoService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_yacimiento' })
  update(@Payload() dto: UpdateYacimientoDto & { id: number }) {
    return this.yacimientoService.update(dto.id, dto);
  }

  @MessagePattern({cmd:'find_by_cliente'})
  findByCliente(@Payload() id: number){
    console.log(id);
    return this.yacimientoService.findByCliente(id);
  }

  @MessagePattern({ cmd: 'remove_yacimiento' })
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.yacimientoService.deactivate(id);
  }
}
