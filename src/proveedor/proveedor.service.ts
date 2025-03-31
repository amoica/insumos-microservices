import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProveedorService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProveedorService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(dto: CreateProveedorDto) {

    const { contactos, ...createProveedorDto } = dto;

    return this.proveedor.create({
      data:{
        ...createProveedorDto,
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
    return this.proveedor.findMany({
      include: {
        contactos: true,
      },
    });
  }

  findOne(id: number) {
    return this.proveedor.findUnique({
      where: {
        id
      },
      include: {
        contactos: true,
      },
    });
  }

  update(id: number, dto: UpdateProveedorDto) {
    const { contactos, ...updateProveedorDto } = dto;
    return this.proveedor.update({
      where: {
        id,
      },
      data: {
        ...updateProveedorDto,
      },
    });
  }

  //Recordar no eliminar si no dar de baja!
  remove(id: number) {
    return this.proveedor.delete({
      where: {
        id,
      },
    });
  }
}