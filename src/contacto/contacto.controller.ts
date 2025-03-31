import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';

@Controller()
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @MessagePattern({cmd:'createContacto'})
  create(@Payload() createContactoDto: CreateContactoDto) {
    return this.contactoService.create(createContactoDto);
  }

  @MessagePattern({cmd:'findAllContacto'})
  findAll() {
    return this.contactoService.findAll();
  }

  @MessagePattern('findOneContacto')
  findOne(@Payload() id: number) {
    return this.contactoService.findOne(id);
  }

  @MessagePattern('updateContacto')
  update(@Payload() updateContactoDto: UpdateContactoDto) {
    return this.contactoService.update(updateContactoDto.id, updateContactoDto);
  }

  @MessagePattern('removeContacto')
  remove(@Payload() id: number) {
    return this.contactoService.remove(id);
  }
}
