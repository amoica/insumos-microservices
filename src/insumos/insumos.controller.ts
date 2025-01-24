import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('insumos')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  //@Post()
  @MessagePattern({cmd: 'create_insumo'})
  create(@Payload() createInsumoDto: CreateInsumoDto) {
    return this.insumosService.create(createInsumoDto);
  }

  //@Get()
  @MessagePattern({cmd: 'find_all_insumos'})
  findAll( @Payload() paginationDto: PaginationDto) {
    return this.insumosService.findAll(paginationDto);
  }

  //@Get(':id')
  @MessagePattern({cmd: 'find_one_insumo'})
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.insumosService.findOne(+id);
  }

  //@Patch(':id')
  @MessagePattern({cmd: 'update_insumo'})
  update(
    //@Param('id', ParseIntPipe) id: number, 
    //@Body() updateInsumoDto: UpdateInsumoDto
    @Payload() updateInsumo: UpdateInsumoDto) {
    return this.insumosService.update(updateInsumo.id, updateInsumo);
  }

  //@Delete(':id')
  @MessagePattern({cmd: 'delete_insumo'})
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.insumosService.remove(+id);
  }


  @MessagePattern({cmd: 'validate_products'})
  validateProduct(@Payload() ids:number[]){
    return this.insumosService.validateProducts(ids);
  }
}
