import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TareasGlobalesService } from './tareas-globales.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateTareaGlobalDto } from './dto/create-tareas-globale.dto';
import { UpdateTareaGlobalDto } from './dto/update-tareas-globale.dto';

@Controller('tareas-globales')
export class TareasGlobalesController {
  constructor(private readonly tareasGlobalesService: TareasGlobalesService) {}

  @MessagePattern({ cmd: 'create_tarea_global' })
  create(@Payload() createTareaGlobalDto: CreateTareaGlobalDto) {
    return this.tareasGlobalesService.create(createTareaGlobalDto);
  }

  @MessagePattern({ cmd: 'find_all_tareas_globales' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.tareasGlobalesService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_tarea_global' })
  findOne(@Payload('id') id: number) {
    return this.tareasGlobalesService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_tarea_global' })
  update(@Payload() updateTareaGlobalDto: UpdateTareaGlobalDto) {
    return this.tareasGlobalesService.update(
      updateTareaGlobalDto.id,
      updateTareaGlobalDto,
    );
  }

  @MessagePattern({ cmd: 'delete_tarea_global' })
  remove(@Payload('id') id: number) {
    return this.tareasGlobalesService.remove(id);
  }
}