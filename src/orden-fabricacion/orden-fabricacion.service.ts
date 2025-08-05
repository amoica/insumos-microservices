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

  async create(createDto: CreateOrdenFabricacionDto) {
    let pedidoCliente;
    if (createDto.pedidoCliente) {
      pedidoCliente = await this.pedidoCliente.create({
        data: {
          numero: createDto.pedidoCliente.numero,
          cliente: { connect: { id: createDto.pedidoCliente.clienteId } },
          contacto: { connect: { id: createDto.pedidoCliente.contactoId } },
          adjunto: createDto.pedidoCliente.adjunto ?? undefined
        }
      });
    }

    // Armas el objeto de datos
    const ordenData: any = {
      codigo: createDto.codigo,
      productoFabricado: { connect: { id: createDto.productoFabricadoId } },
      cantidad: createDto.cantidad,
      fechaEntrega: createDto.fechaEntrega,
      observaciones: createDto.observaciones,
      nroPresupuesto: createDto.nroPresupuesto,
      prioridad: createDto.prioridad,

      // **Conecta** el yacimiento por su ID
      yacimiento: { connect: { id: createDto.yacimientoId } },

      pedidoCliente: pedidoCliente
        ? { connect: { id: pedidoCliente.id } }
        : undefined,
    };

    const orden = await this.ordenFabricacion.create({
      data: ordenData,
    });

    // … resto de lógica de revisiones …

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
