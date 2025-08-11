import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrdenFabricacionDto } from './dto/create-orden-fabricacion.dto';
import { UpdateOrdenFabricacionDto } from './dto/update-orden-fabricacion.dto';
import { EstadoOrdenFabricacion, Prisma, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { SnapshotSkid } from './types/snapshot-skid.type';

function sanitizeSnapshot(raw: any) {
  if (!raw) return undefined;
  const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return JSON.parse(JSON.stringify(obj, (_k, v) => (v === undefined ? null : v)));
}
function hasContent(s: any) {
  if (!s || typeof s !== 'object') return false;
  const arrs =
    (Array.isArray(s.paneles) && s.paneles.length) ||
    (Array.isArray(s.bombas) && s.bombas.length) ||
    (Array.isArray(s.tableros) && s.tableros.length) ||
    (Array.isArray(s.instrumentos) && s.instrumentos.length) ||
    (Array.isArray(s.extras) && s.extras.length);
  const flags = s.tanque !== undefined || s.calibracion !== undefined || s.psv || s.baterias || s.potenciaPaneles;
  return !!(arrs || flags);
}

@Injectable()
export class OrdenFabricacionService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdenFabricacion');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }



  // ---------- CREATE ----------
  async create(createDto: CreateOrdenFabricacionDto) {
    try {
      // validaciones rápidas...
      if (!createDto.pedidoCliente?.numero) throw new RpcException({ status: 400, message: 'pedidoCliente.numero es obligatorio.' });
      if (!createDto.pedidoCliente?.clienteId) throw new RpcException({ status: 400, message: 'pedidoCliente.clienteId es obligatorio.' });
      if (!createDto.pedidoCliente?.contactoId) throw new RpcException({ status: 400, message: 'pedidoCliente.contactoId es obligatorio.' });

      const snapshot = sanitizeSnapshot(createDto.snapshotSkid);
      const debeVersionar = hasContent(snapshot);

      // 1) upsert del pedido cliente (fuera de TX manual)
      const pc = await this.pedidoCliente.upsert({
        where: { numero: createDto.pedidoCliente.numero },
        update: {},
        create: {
          numero: createDto.pedidoCliente.numero,
          cliente: { connect: { id: createDto.pedidoCliente.clienteId } },
          contacto: { connect: { id: createDto.pedidoCliente.contactoId } },
          adjunto: createDto.pedidoCliente.adjunto ?? undefined,
          fecha: createDto.pedidoCliente.fecha ?? undefined,
        },
        select: { id: true },
      });

      // 2) create de la orden con revisión anidada (si corresponde)
      const orden = await this.ordenFabricacion.create({
        data: {
          codigo: createDto.codigo,
          productoFabricado: { connect: { id: createDto.productoFabricadoId } },
          cantidad: createDto.cantidad,
          fechaEntrega: createDto.fechaEntrega ?? undefined,
          observaciones: createDto.observaciones ?? undefined,
          nroPresupuesto: createDto.nroPresupuesto ?? undefined,
          prioridad: (createDto.prioridad as any) ?? undefined,
          yacimiento: { connect: { id: createDto.yacimiento } },
          pedidoCliente: { connect: { id: pc.id } },
          revisiones: debeVersionar
            ? {
              create: {
                snapshot: snapshot as Prisma.JsonObject,
                version: 1,
                revisionObservacion: 'Versión inicial (creación)',
              },
            }
            : undefined,
        },
        select: { id: true, codigo: true },
      });

      return { ...orden, created: true, revisionVersion: debeVersionar ? 1 : null };

    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new RpcException({ status: 409, message: `Conflicto de unicidad (${error?.meta?.target || 'desconocido'}).` });
      }
      this.logger.error(error?.message || error);
      throw new RpcException({ status: 500, message: error?.message || 'Error creando la orden de fabricación.' });
    }
  }

  // ---------- LIST ----------
  async findAll() {
    const data = await this.ordenFabricacion.findMany({
      orderBy: { fechaEmision: 'desc' },
      select: {
        id: true,
        codigo: true,
        estado: true,
        prioridad: true,
        fechaEntrega: true,
        productoFabricado: { select: { nombre: true, tipo: true, lts: true } },
        pedidoCliente: {
          select: {
            numero: true,
            cliente: { select: { id: true, nombre: true } },
            contacto: { select: { id: true, nombre: true } },
          },
        },
      },
    });
    return { data };
  }

  // ---------- GET ONE ----------
  async findOne(id: number) {
    const of = await this.ordenFabricacion.findUnique({
      where: { id },
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
            adjunto: true,                 // 👈 AÑADIR ESTO
            contacto: { select: { id: true, nombre: true, email: true, telefono: true } },
            cliente: { select: { nombre: true, id: true } },
          },
        },
        revisiones: { orderBy: { version: 'desc' }, take: 1, select: { version: true, snapshot: true } },
      },
    });

    if (!of) {
      throw new RpcException({ message: `Orden with id #${id} not found`, status: HttpStatus.BAD_REQUEST });
    }

    const last = of.revisiones[0] ?? null;
    return {
      ...of,
      snapshotSkid: (last?.snapshot as any) ?? null,
      revisionVersion: last?.version ?? null,
    };
  }

  // ---------- UPDATE ----------
  async update(id: number, dto: UpdateOrdenFabricacionDto) {
    try {
      return await this.$transaction(async (tx) => {
        const orden = await tx.ordenFabricacion.findUnique({
          where: { id },
          include: { revisiones: { select: { version: true }, orderBy: { version: 'desc' } } },
        });

        if (!orden) {
          throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Orden con ID #${id} no encontrada.` });
        }

        const estadoActual = orden.estado;

        // 1) Versionado si está CREADA y viene snapshot
        let nuevaVersion: number | null = null;

        const raw = dto.snapshotSkid;
        const snapshot: SnapshotSkid | undefined =
          raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : undefined;

        if (snapshot && estadoActual === 'CREADA') {
          const last = orden.revisiones[0]?.version || 0;
          nuevaVersion = last + 1;
          await tx.ordenFabricacionRevision.create({
            data: {
              ordenFabricacionId: id,
              snapshot: snapshot as Prisma.JsonObject,
              version: nuevaVersion,
              revisionObservacion: dto.revisionObservacion || `Actualización a versión ${nuevaVersion}`,
            },
          });
        }

        // 2) Cambio de estado (reglas)
        const estadoNuevo = dto.estado as EstadoOrdenFabricacion | undefined;
        if (!estadoNuevo) {
          return {
            success: true,
            message: nuevaVersion ? `Orden actualizada. Nueva versión: ${nuevaVersion}.` : `Orden actualizada.`,
            revisionVersion: nuevaVersion,
          };
        }

        if (estadoActual === 'APROBADA') {
          throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'La orden ya está APROBADA; no se permiten modificaciones ni nuevas versiones.' });
        }
        if (estadoActual !== 'CREADA' && estadoNuevo === 'CREADA') {
          throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: `Transición inválida: no se puede volver a CREADA desde ${estadoActual}.` });
        }

        // 3) Aprobar → validar stock y reservar (expandir recetas → insumos)
        if (estadoNuevo === 'APROBADA') {
          const last = await tx.ordenFabricacionRevision.findFirst({
            where: { ordenFabricacionId: id },
            orderBy: { version: 'desc' },
            select: { snapshot: true },
          });

          const snapshotFinal: SnapshotSkid | undefined = snapshot ?? (last?.snapshot as any);

          if (!snapshotFinal || !Object.keys(snapshotFinal).length) {
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'No se puede APROBAR sin snapshot válido.' });
          }

          const depositoId = dto.depositoId;
          if (!depositoId) {
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'Para aprobar se requiere depositoId.' });
          }

          await this.reserveFromSnapshot(tx, id, orden.cantidad, snapshotFinal, depositoId);
        }

        // 4) Persistir estado
        await tx.ordenFabricacion.update({ where: { id }, data: { estado: estadoNuevo } });

        return {
          success: true,
          message: estadoNuevo === 'APROBADA'
            ? `Orden aprobada y stock reservado.`
            : nuevaVersion ? `Orden actualizada. Nueva versión: ${nuevaVersion}.` : `Orden actualizada.`,
          revisionVersion: nuevaVersion,
          estado: estadoNuevo,
        };
      });
    } catch (error: any) {
      this.logger.error(error?.message || error);
      throw new RpcException({
        status: error instanceof RpcException ? (error as any).error?.status || HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR,
        message: error instanceof RpcException ? (error as any).error?.message : error?.message || 'Error actualizando la orden.',
      });
    }
  }

  // ---------- HELPERS ----------
  // Expande IDs de receta (tableros/instrumentos) a {insumoId -> cantidad}
  private async expandRecetasToInsumos(
    tx: Prisma.TransactionClient,
    recetaIds: number[],
  ): Promise<Record<number, number>> {
    if (!recetaIds?.length) return {};
    const comps = await tx.componenteProducto.findMany({
      where: { recetaProductoId: { in: recetaIds } },
      select: { insumoId: true, cantidad: true, recetaProductoId: true },
    });
    const acc: Record<number, number> = {};
    for (const c of comps) {
      const insumoId = Number(c.insumoId);
      const cant = Number(c.cantidad || 0);
      if (!insumoId || !cant) continue;
      acc[insumoId] = (acc[insumoId] || 0) + cant;
    }
    return acc;
  }

  /**
   * Multiplica por cantidad de orden, valida stock y reserva.
   */
  private async reserveFromSnapshot(
    tx: Prisma.TransactionClient,
    ordenFabricacionId: number,
    cantidadOrden: number,
    snapshot: SnapshotSkid,
    depositoId: number,
  ) {
    type ReqMap = Record<number, number>;
    const reqs: ReqMap = {};
    const add = (insumoId: any, cant: any) => {
      const id = Number(insumoId);
      const c = Math.max(Number(cant) || 0, 0);
      if (!id || !c) return;
      reqs[id] = (reqs[id] || 0) + c;
    };

    // 1) Insumos directos
    for (const p of snapshot?.paneles ?? []) add(p.insumoId, Number(p.cantidad) * cantidadOrden);
    for (const b of snapshot?.bombas ?? []) add(b.insumoId, Number(b.cantidad) * cantidadOrden);

    // 2) Recetas (tableros/instrumentos) → insumos
    const recetasIds: number[] = [
      ...(snapshot?.tableros ?? []),
      ...(snapshot?.instrumentos ?? []),
    ];
    if (recetasIds.length) {
      const pack = await this.expandRecetasToInsumos(tx, recetasIds);
      for (const [insumoIdStr, cant] of Object.entries(pack)) {
        add(Number(insumoIdStr), Number(cant) * cantidadOrden);
      }
    }

    // 3) Extras
    for (const sec of snapshot?.extras ?? []) {
      for (const it of sec.items ?? []) add(it.insumoId, Number(it.cantidad) * cantidadOrden);
    }

    // 4) Validación de stock
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
      throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: `Falta stock para ${faltantes.length} insumo(s).`, details: faltantes } as any);
    }

    // 5) Reservar
    for (const id of insumoIds) {
      const req = reqs[id];
      await tx.reserva.create({
        data: {
          insumo: { connect: { id } },
          deposito: { connect: { id: depositoId } },
          cantidad: req,
          estado: 'RESERVADA',
          ordenFabricacion: { connect: { id: ordenFabricacionId } },
        },
      });
      await tx.inventario.updateMany({
        where: { insumoId: id, depositoId },
        data: { stockComprometido: { increment: req } },
      });
    }
  }


  async setPedidoAdjunto(ordenFabricacionId: number, adjunto: string) {
    try {
      // 1) Obtener pedidoClienteId
      const of = await this.ordenFabricacion.findUnique({
        where: { id: ordenFabricacionId },
        select: { id: true, pedidoClienteId: true },
      });

      if (!of) {
        throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Orden #${ordenFabricacionId} no encontrada.` });
      }
      if (!of.pedidoClienteId) {
        throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'La orden no tiene pedidoCliente asociado.' });
      }

      // 2) Actualizar adjunto
      const updated = await this.pedidoCliente.update({
        where: { id: of.pedidoClienteId },
        data: { adjunto },
        select: { id: true, numero: true, adjunto: true },
      });

      return { success: true, pedidoCliente: updated };
    } catch (error: any) {
      this.logger.error(error?.message || error);
      throw new RpcException({
        status: error instanceof RpcException ? (error as any).error?.status || HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR,
        message: error instanceof RpcException ? (error as any).error?.message : error?.message || 'Error seteando adjunto.',
      });
    }
  }

  // ---------- DELETE (placeholder) ----------
  remove(id: number) {
    return `This action removes a #${id} ordenFabricacion`;
  }
}
