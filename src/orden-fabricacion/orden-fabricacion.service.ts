import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrdenFabricacionDto } from './dto/create-orden-fabricacion.dto';
import { UpdateOrdenFabricacionDto } from './dto/update-orden-fabricacion.dto';
import { EstadoOrdenFabricacion, Prisma, PrismaClient } from '@prisma/client';
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
    try {
      // Validaciones mínimas coherentes con tu schema:
      if (!createDto.pedidoCliente) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'pedidoCliente es obligatorio para crear la orden (schema exige pedidoClienteId).',
        });
      }
      if (!createDto.pedidoCliente.numero) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'pedidoCliente.numero es obligatorio.',
        });
      }
      if (!createDto.pedidoCliente.clienteId) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'pedidoCliente.clienteId es obligatorio.',
        });
      }
      // contacto es obligatorio (como pediste)
      if (!createDto.pedidoCliente.contactoId) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'pedidoCliente.contactoId es obligatorio.',
        });
      }

      return await this.$transaction(async (tx) => {
        // 1) PedidoCliente por número (es @unique en tu schema)
        //    Si querés permitir repetición por cliente, deberías cambiar el schema a:
        //    @@unique([numero, clienteId]) en PedidoCliente
        const pc = await tx.pedidoCliente.upsert({
          where: { numero: createDto.pedidoCliente!.numero },
          update: {
            // si querés refrescar algunos campos cuando reusan el número:
            // contactoId: createDto.pedidoCliente!.contactoId,
            // adjunto: createDto.pedidoCliente!.adjunto ?? undefined,
          },
          create: {
            numero: createDto.pedidoCliente!.numero,
            cliente: { connect: { id: createDto.pedidoCliente!.clienteId } },
            contacto: { connect: { id: createDto.pedidoCliente!.contactoId! } },
            adjunto: createDto.pedidoCliente!.adjunto ?? undefined,
            fecha: createDto.pedidoCliente!.fecha ?? undefined,
          },
          select: { id: true },
        });

        // 2) Crear la Orden
        const orden = await tx.ordenFabricacion.create({
          data: {
            codigo: createDto.codigo,
            productoFabricado: { connect: { id: createDto.productoFabricadoId } },
            cantidad: createDto.cantidad,
            fechaEntrega: createDto.fechaEntrega ?? undefined,
            observaciones: createDto.observaciones ?? undefined,
            nroPresupuesto: createDto.nroPresupuesto ?? undefined,
            prioridad: (createDto.prioridad as any) ?? undefined, // tu enum Prioridad está en Prisma
            yacimiento: { connect: { id: createDto.yacimiento } },
            pedidoCliente: { connect: { id: pc.id } },
            // estado por defecto CREADA (schema lo pone)
          },
          select: { id: true, codigo: true },
        });

        // 3) Snapshot versión 1 (si vino)
        if (createDto.snapshotSkid) {
          await tx.ordenFabricacionRevision.create({
            data: {
              ordenFabricacionId: orden.id,
              snapshot: createDto.snapshotSkid as Prisma.JsonObject,
              version: 1,
              revisionObservacion: 'Versión inicial (creación)',
            },
          });
        }

        return {
          ...orden,
          created: true,
          revisionVersion: createDto.snapshotSkid ? 1 : null,
        };
      });
    } catch (error: any) {
      // Prisma unique violation, etc.
      if (error?.code === 'P2002') {
        // ejemplo: PedidoCliente.numero duplicado
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: `Conflicto de unicidad (${error?.meta?.target || 'desconocido'}).`,
        });
      }
      this.logger.error(error?.message || error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message || 'Error creando la orden de fabricación.',
      });
    }
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

  // ---------- UPDATE ----------
  async update(id: number, dto: UpdateOrdenFabricacionDto) {
    try {
      return await this.$transaction(async (tx) => {
        const orden = await tx.ordenFabricacion.findUnique({
          where: { id },
          include: {
            revisiones: { select: { version: true }, orderBy: { version: 'desc' } },
          },
        });

        if (!orden) {
          throw new RpcException({
            status: HttpStatus.NOT_FOUND,
            message: `Orden con ID #${id} no encontrada.`,
          });
        }

        // Estado actual
        const estadoActual = orden.estado;

        // 1) Versionado: sólo si la orden está CREADA (editable) y llega un nuevo snapshot
        let nuevaVersion: number | null = null;
        if (dto.snapshotSkid && estadoActual === 'CREADA') {
          const last = orden.revisiones[0]?.version || 0;
          nuevaVersion = last + 1;
          await tx.ordenFabricacionRevision.create({
            data: {
              ordenFabricacionId: id,
              snapshot: dto.snapshotSkid as Prisma.JsonObject,
              version: nuevaVersion,
              revisionObservacion:
                dto.revisionObservacion || `Actualización a versión ${nuevaVersion}`,
            },
          });
        }

        // 2) Cambio de estado (con reglas)
        let estadoNuevo = dto.estado as EstadoOrdenFabricacion | undefined;

        // Si no viene estado, solo devolvemos versión creada si hubo.
        if (!estadoNuevo) {
          return {
            success: true,
            message: nuevaVersion
              ? `Orden actualizada. Nueva versión: ${nuevaVersion}.`
              : `Orden actualizada.`,
            revisionVersion: nuevaVersion,
          };
        }

        // Reglas básicas de transición:
        // - Desde CREADA podés quedar en CREADA (seguir versionando) o pasar a APROBADA
        // - Una vez APROBADA, no permitir más versionado ni volver atrás
        if (estadoActual === 'APROBADA') {
          throw new RpcException({
            status: HttpStatus.BAD_REQUEST,
            message:
              'La orden ya está APROBADA; no se permiten modificaciones ni nuevas versiones.',
          });
        }
        if (estadoActual !== 'CREADA' && estadoNuevo === 'CREADA') {
          throw new RpcException({
            status: HttpStatus.BAD_REQUEST,
            message: `Transición inválida: no se puede volver a CREADA desde ${estadoActual}.`,
          });
        }

        // 3) Si aprueban, validar stock y reservar todo según snapshot más reciente
        if (estadoNuevo === 'APROBADA') {
          // necesitamos un snapshot "final"
          const snapshot =
            (dto.snapshotSkid as any) ??
            (await tx.ordenFabricacionRevision.findFirst({
              where: { ordenFabricacionId: id },
              orderBy: { version: 'desc' },
              select: { snapshot: true },
            }))?.snapshot;

          if (!snapshot) {
            throw new RpcException({
              status: HttpStatus.BAD_REQUEST,
              message:
                'No se puede APROBAR sin snapshot. Enviá snapshotSkid o creá una revisión previa.',
            });
          }

          // necesitamos depositoId (negocio)
          const depositoId = (dto as any).depositoId as number | undefined;
          if (!depositoId) {
            throw new RpcException({
              status: HttpStatus.BAD_REQUEST,
              message:
                'Para aprobar se requiere depositoId (dónde reservar el stock).',
            });
          }

          // Reservar todo (valida faltantes)
          await this.reserveFromSnapshot(tx, id, orden.cantidad, snapshot, depositoId);
        }

        // 4) Persistir cambio de estado
        await tx.ordenFabricacion.update({
          where: { id },
          data: { estado: estadoNuevo },
        });

        return {
          success: true,
          message:
            estadoNuevo === 'APROBADA'
              ? `Orden aprobada y stock reservado.`
              : nuevaVersion
                ? `Orden actualizada. Nueva versión: ${nuevaVersion}.`
                : `Orden actualizada.`,
          revisionVersion: nuevaVersion,
          estado: estadoNuevo,
        };
      });
    } catch (error: any) {
      this.logger.error(error?.message || error);
      throw new RpcException({
        status:
          error instanceof RpcException
            ? (error as any).error?.status || HttpStatus.BAD_REQUEST
            : HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error instanceof RpcException
            ? (error as any).error?.message
            : error?.message || 'Error actualizando la orden.',
      });
    }
  }

  // ---------- HELPERS ----------
  /**
   * Toma un snapshot (paneles, bombas, etc.), lo multiplica por la cantidad de orden,
   * valida stock (Inventario) y crea Reservas + incrementa stockComprometido.
   * Si falta stock en algún ítem, lanza RpcException con el detalle y NO reserva nada.
   */
  private async reserveFromSnapshot(
    tx: Prisma.TransactionClient,
    ordenFabricacionId: number,
    cantidadOrden: number,
    snapshot: any,
    depositoId: number,
  ) {
    // 1) Armar lista de requerimientos agregada por insumoId
    type Req = { insumoId: number; cantidad: number };
    const reqs: Record<number, number> = {};

    const add = (insumoId: any, cant: any) => {
      const id = Number(insumoId);
      const c = Math.max(Number(cant) || 0, 0);
      if (!id || !c) return;
      reqs[id] = (reqs[id] || 0) + c;
    };

    // paneles y bombas vienen con { insumoId, cantidad }
    for (const p of snapshot?.paneles ?? []) {
      add(p.insumoId, Number(p.cantidad) * cantidadOrden);
    }
    for (const b of snapshot?.bombas ?? []) {
      add(b.insumoId, Number(b.cantidad) * cantidadOrden);
    }

    // Si también querés reservar tableros e instrumentos (si tus arrays son IDs):
    for (const t of snapshot?.tableros ?? []) {
      add(Number(t), 1 * cantidadOrden);
    }
    for (const i of snapshot?.instrumentos ?? []) {
      add(Number(i), 1 * cantidadOrden);
    }

    // 2) Validar stock disponible por insumo (stockActual - stockComprometido)
    const faltantes: Array<{ insumoId: number; requerido: number; disponible: number }> = [];

    const insumoIds = Object.keys(reqs).map(Number);
    if (!insumoIds.length) return;

    const inventarios = await tx.inventario.findMany({
      where: { depositoId, insumoId: { in: insumoIds } },
      select: { insumoId: true, stockActual: true, stockComprometido: true },
    });

    const invByInsumo = new Map(inventarios.map(i => [i.insumoId, i]));

    for (const id of insumoIds) {
      const req = reqs[id];
      const inv = invByInsumo.get(id);
      const disponible = inv ? inv.stockActual - inv.stockComprometido : 0;
      if (disponible < req) {
        faltantes.push({ insumoId: id, requerido: req, disponible });
      }
    }

    if (faltantes.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Falta stock para ${faltantes.length} insumo(s).`,
        details: faltantes,
      } as any);
    }

    // 3) Crear Reservas y subir stockComprometido
    for (const id of insumoIds) {
      const req = reqs[id];

      // reserva
      await tx.reserva.create({
        data: {
          insumo: { connect: { id } },
          deposito: { connect: { id: depositoId } },
          cantidad: req,
          estado: 'RESERVADA',
          ordenFabricacion: { connect: { id: ordenFabricacionId } },
        },
      });

      // subir comprometido
      await tx.inventario.updateMany({
        where: { insumoId: id, depositoId },
        data: { stockComprometido: { increment: req } },
      });
    }
  }


  remove(id: number) {
    return `This action removes a #${id} ordenFabricacion`;
  }
}
