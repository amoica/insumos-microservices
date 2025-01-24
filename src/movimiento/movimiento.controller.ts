import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MovimientoService } from './movimiento.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@Controller()
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  @MessagePattern({cmd: 'createMovimiento'})
  create(@Payload() createMovimientoDto: CreateMovimientoDto) {
    return this.movimientoService.create(createMovimientoDto);
  }

  @MessagePattern({cmd: 'findAllMovimiento'})
  findAll() {
    return this.movimientoService.findAll();
  }

  @MessagePattern({cmd: 'findOneMovimiento'})
  findOne(@Payload() id: number) {
    return this.movimientoService.findOne(id);
  }

  @MessagePattern('updateMovimiento')
  update(@Payload() updateMovimientoDto: UpdateMovimientoDto) {
    return this.movimientoService.update(updateMovimientoDto.id, updateMovimientoDto);
  }

  @MessagePattern('removeMovimiento')
  remove(@Payload() id: number) {
    return this.movimientoService.remove(id);
  }

  @MessagePattern({cmd: 'getStockDetailByInsumo'})
  getStockDetailByInsumo(@Payload() payload: { insumoId: number }){
    const { insumoId } = payload; // Extrae el insumoId
    return this.movimientoService.getStockDetailByInsumo(insumoId);
  }

  @MessagePattern({cmd: 'getGeneralStock'})
  getGeneralStock(){
    return this.movimientoService.getGeneralStock();
  }
}
