import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ContactoService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('ContactoService');
  
  onModuleInit() {
    this.$connect();
    this.logger.log('Database conected');
  }

  create(createContactoDto: CreateContactoDto) {
    
    if (!createContactoDto.clienteId && !createContactoDto.proveedorId) {
      throw new RpcException({
        message: 'Debe especificar un clienteId o un proveedorId',
        status: HttpStatus.BAD_REQUEST
      })
    }

    return this.contacto.create({
      data: createContactoDto
    })
  }

  findAll() {
    return this.contacto.findMany({
      include:{
        cliente:{
          select:{
            id: true,
            nombre:true
          }
        },
        proveedor: {
          select:{
            id: true,
            nombre: true
          }
        }
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} contacto`;
  }

  update(id: number, updateContactoDto: UpdateContactoDto) {
    return `This action updates a #${id} contacto`;
  }

  remove(id: number) {
    return `This action removes a #${id} contacto`;
  }
}
