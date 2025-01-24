import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

@Controller()
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @MessagePattern('createReserva')
  create(@Payload() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  @MessagePattern('findAllReservas')
  findAll() {
    return this.reservasService.findAll();
  }

  @MessagePattern('findOneReserva')
  findOne(@Payload() id: number) {
    return this.reservasService.findOne(id);
  }

  @MessagePattern('updateReserva')
  update(@Payload() updateReservaDto: UpdateReservaDto) {
    return this.reservasService.update(updateReservaDto.id, updateReservaDto);
  }

  @MessagePattern('removeReserva')
  remove(@Payload() id: number) {
    return this.reservasService.remove(id);
  }
}
