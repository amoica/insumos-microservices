import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdenFabricacionService } from './orden-fabricacion.service';
import { CreateOrdenFabricacionDto } from './dto/create-orden-fabricacion.dto';
import { UpdateOrdenFabricacionDto } from './dto/update-orden-fabricacion.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller()
export class OrdenFabricacionController {
  constructor(private readonly ordenFabricacionService: OrdenFabricacionService) { }

  @MessagePattern({ cmd: 'createOrdenFabricacion' })
  create(@Payload() createOrdenFabricacionDto: CreateOrdenFabricacionDto) {
    return this.ordenFabricacionService.create(createOrdenFabricacionDto);
  }

  @MessagePattern({ cmd: 'findAllOrdenFabricacion' })
  findAll() {
    return this.ordenFabricacionService.findAll();
  }

  @MessagePattern({ cmd: 'findOneOrdenFabricacion' })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.ordenFabricacionService.findOne(id);
  }

  @MessagePattern({ cmd: 'updateOrdenFabricacion' })
  update(@Payload() updateOrdenFabricacionDto: UpdateOrdenFabricacionDto) {
    console.log('updateOrdenFabricacionDto', updateOrdenFabricacionDto);
    return this.ordenFabricacionService.update(updateOrdenFabricacionDto.id, updateOrdenFabricacionDto);
  }

  @MessagePattern({ cmd: 'setPedidoAdjunto' })
  setPedidoAdjunto(
    @Payload() payload: { ordenFabricacionId: number; adjunto: string }
  ) {
    return this.ordenFabricacionService.setPedidoAdjunto(
      payload.ordenFabricacionId,
      payload.adjunto
    );
  }

  @MessagePattern('removeOrdenFabricacion')
  remove(@Payload() id: number) {
    return this.ordenFabricacionService.remove(id);
  }
}
