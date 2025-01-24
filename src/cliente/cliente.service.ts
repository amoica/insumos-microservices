import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ClienteService extends PrismaClient implements OnModuleInit {


  private readonly logger = new Logger('ClienteService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database conected');
  }

  create(createClienteDto: CreateClienteDto) {

    return this.cliente.create({
      data: createClienteDto
    })
  }

  findAll() {
    
    return this.cliente.findMany();
  }

  findOne(id: number) {
    
    return this.cliente.findUnique({
      where: {
        id
      }
    })
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    
    return this.cliente.update({
      where: {
        id
      },
      data: updateClienteDto
    })

  }

  remove(id: number) {
    
    return this.cliente.delete({
      where: {
        id
      }
    })

  }
}
