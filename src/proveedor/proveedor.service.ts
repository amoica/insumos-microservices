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

  create(createProveedorDto: CreateProveedorDto) {
    return this.proveedor.create({
      data: createProveedorDto,
    });
  }

  findAll() {
    return this.proveedor.findMany();
  }

  findOne(id: number) {
    return this.proveedor.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateProveedorDto: UpdateProveedorDto) {
    return this.proveedor.update({
      where: {
        id,
      },
      data: updateProveedorDto,
    });
  }

  remove(id: number) {
    return this.proveedor.delete({
      where: {
        id,
      },
    });
  }
}