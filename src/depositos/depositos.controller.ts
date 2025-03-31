import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DepositosService } from './depositos.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller()
export class DepositosController {
  constructor(private readonly depositosService: DepositosService) {}

  @MessagePattern({cmd: 'createDeposito'})
  create(@Payload() createDepositoDto: CreateDepositoDto) {
    return this.depositosService.create(createDepositoDto);
  }

  @MessagePattern({cmd: 'findAllDepositos'})
  findAll( @Payload() paginationDto: PaginationDto) {
    return this.depositosService.findAll(paginationDto);
  }

  @MessagePattern({cmd: 'findOneDeposito'})
  findOne(@Payload() id: number) {
    return this.depositosService.findOne(id);
  }

  @MessagePattern({cmd: 'updateDeposito'})
  update(@Payload() updateDeposito: UpdateDepositoDto) {
    return this.depositosService.update(updateDeposito.id, updateDeposito);
  }

  @MessagePattern({cmd: 'removeDeposito'})
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.depositosService.remove(id);
  }

  @MessagePattern({cmd: 'updateStockDeposito'})
  updateStock(@Payload() updateStockDto: UpdateStockDto){
    /*return this.depositosService.updateStock(updateStockDto);*/

    return
  }

  
}
