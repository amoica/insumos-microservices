import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrdenFabricacionDto } from './dto/create-orden-fabricacion.dto';
import { UpdateOrdenFabricacionDto } from './dto/update-orden-fabricacion.dto';
import { EstadoOrdenFabricacion, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid'; // Usa esta librería para generar identificadores únicos si es necesario
import { UpdateEstadoDto } from './dto/update-estado.dto';


@Injectable()
export class OrdenFabricacionService extends PrismaClient {



  async create(createOrdenFabricacionDto: CreateOrdenFabricacionDto) {
    const { productoFabricadoId, cantidad } = createOrdenFabricacionDto;

    //verificar que el producto fabricado existe

    const productoFabricado = await this.productoFabricado.findUnique({
      where: { id: productoFabricadoId },
      include: {
        componentes: {
          include: {
            insumo: true
          }

        }
      }
    })

    if (!productoFabricado) {
      throw new RpcException({
        message: `Producto fabricado con ID ${productoFabricadoId} no encontrado`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    // crear la orden de fabricación

    const ordenFabricacion = await this.ordenFabricacion.create({
      data: {
        numero: uuidv4(),
        productoFabricado: {
          connect: { id: createOrdenFabricacionDto.productoFabricadoId }
        },
        cantidad,
        estado: 'PENDIENTE',
        observaciones: createOrdenFabricacionDto.observaciones,
        fechaEntrega: createOrdenFabricacionDto.fechaEntrega
      }
    })

    // crear las reservas para los insumos 

    for (const componente of productoFabricado.componentes) {
      const { insumo, cantidad: cantidadPorUnidad } = componente;

      //Cantidad total requerida

      const cantidadTotal = cantidadPorUnidad * cantidad;

      //verificar stock disponible

      const stock = await this.stock.findMany({
        where: { insumoId: insumo.id, currentStock: { gte: cantidadTotal } }
      });

      //revisar minimo y disparar solicitud
      if (stock.length === 0) {
        throw new RpcException({
          message: `No hay suficiente stock del insumo ${insumo.name}`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Reservar stock
      await this.reserva.create({
        data: {
          insumoId: insumo.id,
          depositoId: stock[0].depositoId, // Usar el primer depósito con stock disponible
          cantidad: cantidadTotal,
          estado: 'RESERVADO',
          referenciaId: ordenFabricacion.id,
          referenciaTipo: 'OrdenFabricacion',
        },
      });

      // Actualizar el stock comprometido
      await this.stock.update({
        where: { id: stock[0].id },
        data: { committedStock: stock[0].committedStock + cantidadTotal },
      });
    }

    return ordenFabricacion;

  }

  async findAll() {
    return this.ordenFabricacion.findMany();
  }

  async findByEstado(estado: EstadoOrdenFabricacion) {
    return this.ordenFabricacion.findMany({ where: { estado } });
  }

  async updateEstado(updateEstadoDto: UpdateEstadoDto) {
    // Validar que la orden existe
    const { estado, id } = updateEstadoDto
    const orden = await this.ordenFabricacion.findUnique({ where: { id } });

    if (!orden) {
      throw new RpcException({
        message: `Orden de fabricación con ID ${id} no encontrada`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Actualizar el estado
    return this.ordenFabricacion.update({
      where: { id },
      data: { estado },
    });
  }


  findOne(id: number) {
    return `This action returns a #${id} ordenFabricacion`;
  }

  update(id: number, updateOrdenFabricacionDto: UpdateOrdenFabricacionDto) {
    return `This action updates a #${id} ordenFabricacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordenFabricacion`;
  }
}
