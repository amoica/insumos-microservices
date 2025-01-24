import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { number } from 'joi';

@Injectable()
export class MovimientoService extends PrismaClient {
  async create(createMovimientoDto: CreateMovimientoDto) {
    const { insumoId, depositoId, tipo, cantidad, motivo, referenciaId, referenciaTipo } = createMovimientoDto;

    // validar que el insumo y el deposito existan

    const insumo = await this.insumo.findUnique({ where: { id: insumoId } });

    const deposito = await this.deposito.findUnique({ where: { id: depositoId } });

    if (!insumo || !deposito) {
      throw new RpcException({
        message: 'Insumo o Depósito no encontrado',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // buscar el stock actual

    const stock = await this.stock.findUnique({
      where: { insumoId_depositoId: { insumoId, depositoId } }
    })

    if (!stock && tipo === 'ENTRADA') {
      await this.stock.create({
        data: {
          insumoId,
          depositoId,
          currentStock: cantidad,
          committedStock: 0,
          incomingStock: 0,
        }
      });
    } else if (!stock) {
      throw new RpcException({
        message: `No se encontró stock para el insumo en este depósito`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Actualizar el stock según el movimiento

    let updateStock = stock?.currentStock || 0;

    if (tipo === 'ENTRADA') {
      updateStock += cantidad;
    } else if (tipo === 'SALIDA') {
      if (updateStock < cantidad) {
        throw new RpcException({
          message: `Stock insuficiente para realizar la salida`,
          status: HttpStatus.BAD_REQUEST,
        });
      }
      updateStock -= cantidad;
    }

    // Actualizar el stock en la base de datos

    return this.movimiento.create({
      data: {
        insumo: { connect: { id: insumoId } }, // Relación con insumo
        deposito: { connect: { id: depositoId } }, // Relación con depósito
        tipo,
        cantidad,
        motivo: motivo || null, // Opcional
        referenciaId: referenciaId || null, // Opcional
        referenciaTipo: referenciaTipo || null, // Opcional
      },
    })


  }

  findAll() {
    return this.movimiento.findMany({
      select: {
        id: true, // Incluye el ID del movimiento si lo necesitas
        tipo: true,
        cantidad: true,
        motivo: true,
        referenciaId: true,
        referenciaTipo: true,
        fecha: true,
        insumo: {
          select: {
            id: true, // Incluye el ID del insumo si es necesario
            name: true, // Devuelve solo el nombre del insumo
          },
        },
        deposito: {
          select: {
            id: true, // Incluye el ID del depósito si es necesario
            name: true, // Devuelve solo el nombre del depósito
          },
        },
      },
    })
  }

  async getStockDetail(insumoId?: number) {

    const whereClause = insumoId ? { insumoId } : {};

    // Agrupar movimientos por insumos y depositos, calculando las cantidad

    const stock = await this.movimiento.groupBy({
      by: ['insumoId', 'depositoId'],
      _sum: { cantidad: true }
    });

    // opcional: Validar stock minimo

    return Promise.all(
      stock.map(async (item) => {
        const insumo = await this.insumo.findUnique({
          where: { id: item.insumoId }
        });

        return {
          insumoId: item.insumoId,
          depositoId: item.depositoId,
          cantidad: item._sum.cantidad || 0,
          alerta:
            item._sum.cantidad < (insumo?.minimunStock || 0)
              ? 'STOCK BAJO'
              : 'OK',
        }
      })
    )
  }

  async getStockDetailByInsumo(insumoId: number) {

    console.log(insumoId);
    // Agrupar movimientos por insumo y depósito
    const stock = await this.movimiento.groupBy({
      by: ['insumoId', 'depositoId'],
      _sum: { cantidad: true },
      where: { insumoId: insumoId },
    });

    // Obtener detalles del insumo
    const insumo = await this.insumo.findUnique({
      where: { id: insumoId },
    });

    if (!insumo) {
      throw new Error(`El insumo con ID ${insumoId} no existe.`);
    }

    return {
      insumo: {
        id: insumo.id,
        name: insumo.name,
        code: insumo.code,
        description: insumo.description,
        condition: insumo.condition,
        minimunStock: insumo.minimunStock,
      },
      stockDetails: await Promise.all(
        stock.map(async (item) => {
          const deposito = await this.deposito.findUnique({
            where: { id: item.depositoId },
          });

          return {
            deposito: {
              id: deposito?.id,
              name: deposito?.name,
              ciudad: deposito?.ciudad,
              direccion: deposito?.direccion,
            },
            cantidad: item._sum.cantidad || 0,
          };
        }),
      ),
    };
  }

  async getGeneralStock() {
    // Agrupar movimientos por insumo para calcular el stock total
    const stock = await this.movimiento.groupBy({
      by: ['insumoId'],
      _sum: { cantidad: true },
    });

    return Promise.all(
      stock.map(async (item) => {
        const insumo = await this.insumo.findUnique({
          where: { id: item.insumoId },
          include: { Reserva: true },
        });

        return {
          insumo: {
            id: insumo?.id,
            name: insumo?.name,
            description: insumo?.description,
            code: insumo?.code
          },
          totalCantidad: item._sum.cantidad || 0,
          totalReservado: insumo?.Reserva?.reduce((total, reserva) => total + reserva.cantidad, 0) || 0,
          alerta:
            (item._sum.cantidad || 0) <
              (insumo?.minimunStock || 0)
              ? 'STOCK BAJO'
              : 'STOCK OK',
        };
      }),
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} movimiento`;
  }

  update(id: number, updateMovimientoDto: UpdateMovimientoDto) {
    return `This action updates a #${id} movimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} movimiento`;
  }
}
