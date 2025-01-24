import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

import { CreateTareaGlobalDto } from './dto/create-tareas-globale.dto';
import { UpdateTareaGlobalDto } from './dto/update-tareas-globale.dto';

@Injectable()
export class TareasGlobalesService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('TareasGlobalesService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async create(createTareaGlobalDto: CreateTareaGlobalDto) {
    return this.tareaGlobal.create({
      data: createTareaGlobalDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPage = await this.tareaGlobal.count();
    const lastPage = Math.ceil(totalPage / limit);

    return {
      data: await this.tareaGlobal.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        page,
        total: totalPage,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const tarea = await this.tareaGlobal.findUnique({
      where: { id },
    });

    if (!tarea) {
      throw new RpcException({
        message: `TareaGlobal with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return tarea;
  }

  async update(id: number, updateTareaGlobalDto: UpdateTareaGlobalDto) {
    const { id: _, ...data } = updateTareaGlobalDto;

    await this.findOne(id);

    return this.tareaGlobal.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.tareaGlobal.delete({
      where: { id },
    });
  }
}