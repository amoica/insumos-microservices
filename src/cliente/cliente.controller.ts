import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller()
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @MessagePattern({cmd: 'create_cliente'})
  create(@Payload() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }

  @MessagePattern({cmd: 'find_all_clientes'})
  
  findAll() {
    return this.clienteService.findAll();
  }

  @MessagePattern({cmd: 'find_one_cliente'})
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.clienteService.findOne(id);
  }

  @MessagePattern({cmd: 'update_cliente'})
  update(@Payload() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(updateClienteDto.id, updateClienteDto);
  }

  @MessagePattern({cmd: 'remove_cliente'})
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.clienteService.remove(id);
  }
}
