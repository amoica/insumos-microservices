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

  create(dto: CreateClienteDto) {

    const {contactos, ...clienteData} = dto;

    return this.cliente.create({
      data: {
        ...clienteData,
        ...(contactos && contactos.length > 0
          ? {
              contactos: {
                create: contactos.map((contactoDto) => ({
                  ...contactoDto
                })),
              },
            }
          : {}),
      },
      // Opcionalmente incluimos contactos en la respuesta
      include: {
        contactos: true,
      },
    });
  }


  findAll() {
    
    return this.cliente.findMany(
      {
        include: {
          contactos: true
        }
      }
    );
  }

  findOne(id: number) {
    
    return this.cliente.findUnique({
      where: {
        id
      },
      include: {
        contactos: true
      }
    })
  }

  update(id: number, dto: UpdateClienteDto) {
    
    const {contactos, ...updateClienteDto} = dto;
    

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
