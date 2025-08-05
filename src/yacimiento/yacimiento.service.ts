// src/yacimiento/yacimiento.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateYacimientoDto } from './dto/create-yacimiento.dto';
import { UpdateYacimientoDto } from './dto/update-yacimiento.dto';

@Injectable()
export class YacimientoService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('YacimientoService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Prisma conectado para Yacimiento');
  }

  async create(dto: CreateYacimientoDto) {
    // Verificar unicidad (case-insensitive)
    const exists = await this.yacimiento.findFirst({
      where: {
        clienteId: dto.clienteId,
        nombre: { equals: dto.nombre},
      },
    });
    if (exists) {
      throw new BadRequestException(`El yacimiento "${dto.nombre}" ya existe para este cliente.`);
    }
    return this.yacimiento.create({ data: { ...dto, estado: true } });
  }

  findAll() {
    return this.yacimiento.findMany({
      where: { estado: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const yac = await this.yacimiento.findUnique({ where: { id } });
    if (!yac) throw new NotFoundException(`Yacimiento con id ${id} no encontrado`);
    return yac;
  }

  async update(id: number, dto: UpdateYacimientoDto) {
    await this.findOne(id); // lanza NotFound si no existe
    if (dto.nombre) {
      // Verificar unicidad si cambia nombre
      const exists = await this.yacimiento.findFirst({
        where: {
          clienteId: dto.clienteId,
          nombre: { equals: dto.nombre},
          id: { not: id },
        },
      });
      if (exists) {
        throw new BadRequestException(`El yacimiento "${dto.nombre}" ya existe para este cliente.`);
      }
    }
    return this.yacimiento.update({
      where: { id },
      data: dto,
    });
  }

  async findByCliente(clienteId: number){
    return this.yacimiento.findMany({
      where:{
        clienteId,
        estado:true
      },
      orderBy:{nombre:'asc'},
      select:{
        id:true,
        nombre:true
      }
    })
  }

  // En lugar de borrar, marcamos como inactivo
  async deactivate(id: number) {
    await this.findOne(id);
    return this.yacimiento.update({
      where: { id },
      data: { estado: false },
    });
  }
}