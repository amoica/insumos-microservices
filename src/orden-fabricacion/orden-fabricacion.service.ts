import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrdenFabricacionDto } from './dto/create-orden-fabricacion.dto';
import { UpdateOrdenFabricacionDto } from './dto/update-orden-fabricacion.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class OrdenFabricacionService extends PrismaClient implements OnModuleInit {


  private readonly logger = new Logger('OrdenFabricacion');


  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async create(createOrdenFabricacionDto: CreateOrdenFabricacionDto) {

    let pedidoCliente;

    if (createOrdenFabricacionDto.pedidoCliente) {
      pedidoCliente = await this.pedidoCliente.create({
        data: {
          numero: createOrdenFabricacionDto.pedidoCliente.numero,
          cliente: { connect: { id: createOrdenFabricacionDto.pedidoCliente.clienteId } },
          contacto: { connect: { id: createOrdenFabricacionDto.pedidoCliente.contactoId } },
          adjunto: createOrdenFabricacionDto.pedidoCliente.adjunto ? createOrdenFabricacionDto.pedidoCliente.adjunto : undefined
        }
      })
    }

    // Preparar los datos finales de la orden
    const ordenData = {
      // Desestructuramos los campos que van directamente a la orden
      codigo: createOrdenFabricacionDto.codigo,
      productoFabricado: { connect: { id: createOrdenFabricacionDto.productoFabricadoId } },
      cantidad: createOrdenFabricacionDto.cantidad,
      fechaEntrega: createOrdenFabricacionDto.fechaEntrega,
      observaciones: createOrdenFabricacionDto.observaciones,
      nroPresupuesto: createOrdenFabricacionDto.nroPresupuesto,
      prioridad: createOrdenFabricacionDto.prioridad,
      yacimiento: createOrdenFabricacionDto.yacimiento,

      // Asignar la relación con PedidoCliente si se creó
      pedidoCliente: pedidoCliente ? { connect: { id: pedidoCliente.id } } : undefined,
    };

    // Crea la Orden de Fabricación usando la tabla correspondiente
    const orden = await this.ordenFabricacion.create({
      data: ordenData,
    });

    await this.ordenFabricacionRevision.create({
      data: {
        ordenFabricacionId: orden.id,
        snapshot: createOrdenFabricacionDto.snapshotSkid,
        version: 1,
        revisionObservacion: 'Creación de la orden de fabricación',
      }
    })

    return orden;
  }


  async findAll() {

    return {
      data: await this.ordenFabricacion.findMany({

        orderBy: { fechaEmision: 'desc' },
        select: {
          id: true,
          codigo: true,
          estado: true,
          prioridad: true,
          fechaEntrega: true,

          productoFabricado: {
            select: {
              nombre: true,
              tipo: true,
              lts: true
            }
          },

          pedidoCliente: {
            select: {
              numero: true,

              cliente: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              contacto: {
                select: {
                  id: true,
                  nombre: true
                }
              }

            }
          }
        },

        //Incluimos los datos del cliente
      })
    }
  }

  async findOne(id: number) {
    const ordenDeFabricacion = await this.ordenFabricacion.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        estado: true,
        productoFabricadoId: true,
        codigo: true,
        cantidad: true,
        fechaEmision: true,
        fechaEntrega: true,
        observaciones: true,
        nroPresupuesto: true,
        prioridad: true,
        yacimiento: true,
        pedidoCliente: {
          select: {
            numero: true,
            contacto: {
              select: {
                id: true,
                nombre: true,
                email: true,
                telefono: true
              }
            },
            cliente: {
              select: {
                nombre: true,
                id: true
              }
            }
          }

        }
      }


    })

    if (!ordenDeFabricacion) {
      throw new RpcException({
        message: `Insunmo with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    // Buscar la ultima revisión

    const ultimaRevision = await this.ordenFabricacionRevision.findFirst({
      where: { ordenFabricacionId: id },
      orderBy: { version: 'desc' },
    })

    return {
      ...ordenDeFabricacion,
      snapshotSkid: ultimaRevision?.snapshot || null,
      revisionVersion: ultimaRevision?.version || null
    };
  }

  async update(id: number, updateOrdenFabricacionDto: UpdateOrdenFabricacionDto) {
    const orden = await this.ordenFabricacion.findUnique({ where: { id } });

    if (!orden) {
      throw new RpcException({
        message: `Orden con ID #${id} no encontrada.`,
        status: HttpStatus.NOT_FOUND
      });
    }

    const tieneSnapshot = !!updateOrdenFabricacionDto.snapshotSkid;

    if (tieneSnapshot) {
      // Obtener la última versión actual
      const ultimaRevision = await this.ordenFabricacionRevision.findFirst({
        where: { ordenFabricacionId: id },
        orderBy: { version: 'desc' }
      });

      const nuevaVersion = (ultimaRevision?.version || 0) + 1;

      // Crear nueva revisión si hay snapshot
      await this.ordenFabricacionRevision.create({
        data: {
          ordenFabricacionId: id,
          snapshot: updateOrdenFabricacionDto.snapshotSkid,
          version: nuevaVersion,
          revisionObservacion:
            updateOrdenFabricacionDto.revisionObservacion ||
            `Actualización a versión ${nuevaVersion}`
        }
      });
    }

    // Actualizar solo estado
    await this.ordenFabricacion.update({
      where: { id },
      data: {
        estado: updateOrdenFabricacionDto.estado
      }
    });

    return {
      success: true,
      message: tieneSnapshot
        ? `Orden actualizada y versión nueva registrada.`
        : `Orden actualizada sin revisión.`
    };
  }

  remove(id: number) {
    return `This action removes a #${id} ordenFabricacion`;
  }
}
