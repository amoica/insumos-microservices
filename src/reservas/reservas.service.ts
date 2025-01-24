import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ReservasService extends PrismaClient {
  async create(createReservaDto: CreateReservaDto) {
    const { insumoId, depositoId, cantidad, referenciaId, referenciaTipo } = createReservaDto;
    // Crear la reserva
    const reserva = await this.reserva.create({
      data: {
        insumoId,
        depositoId,
        cantidad,
        estado: 'RESERVADO', // Enum o string para el estado de la reserva
        referenciaId,
        referenciaTipo,
      },
    });

    // Actualizar el stock comprometido
    const stock = await this.stock.findUnique({
      where: { insumoId_depositoId: { insumoId, depositoId } },
    });

    if (!stock) {
      throw new RpcException({
        message: `No se encontró stock para el insumo con ID ${insumoId} en el depósito ${depositoId}`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    await this.stock.update({
      where: { id: stock.id },
      data: { committedStock: stock.committedStock + cantidad },
    });

    return reserva;
  }

  async findAll() {
    return await this.reserva.findMany({
      include: {
        insumo: true,
        deposito: true,
      },
    });
  }

  async findOne(id: number) {
    const reserva = await this.reserva.findUnique({
      where: { id },
      include: {
        insumo: true,
        deposito: true,
      },
    });

    if (!reserva) {
      throw new RpcException({
        message: `No se encontró la reserva con ID ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }

  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const { cantidad, ...rest } = updateReservaDto;

    // Actualizar reserva
    const reserva = await this.reserva.update({
      where: { id },
      data: {
        ...rest,
        cantidad,
      },
    });

    return reserva;
  }

  async remove(id: number) {
    // Eliminar la reserva
    await this.reserva.delete({
      where: { id },
    });

    return { message: `Reserva con ID ${id} eliminada` };
  }

}
