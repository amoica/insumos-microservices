import { Controller, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RecetaService } from './receta.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Controller()
export class RecetaController {
  constructor(private readonly recetaService: RecetaService) {}

  @MessagePattern({cmd:'createReceta'})
  create(@Payload() createRecetaDto: CreateRecetaDto) {
    return this.recetaService.create(createRecetaDto);
  }

  @MessagePattern({cmd:'findAllReceta'})
  findAll() {
    return this.recetaService.findAll();
  }

  @MessagePattern({cmd:'findOneReceta'})
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.recetaService.findOne(id);
  }

  @MessagePattern({ cmd: 'updateReceta' })
  async update(@Payload() updateRecetaDto: UpdateRecetaDto) {
    try {
      console.log('Datos recibidos en el microservicio:', updateRecetaDto);
      return await this.recetaService.update(updateRecetaDto.id, updateRecetaDto);
    } catch (error) {
      console.error('Error en el gateway de updateReceta:', error);
  
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error en la validación de la receta'
      });
    }
  }
  

  @MessagePattern({cmd:'removeReceta'})
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.recetaService.remove(id);
  }
}
