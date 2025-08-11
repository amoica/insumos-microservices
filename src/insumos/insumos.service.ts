import { HttpStatus, Injectable, Logger, OnModuleInit, Query } from '@nestjs/common';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';
import { connect } from 'http2';

@Injectable()
export class InsumosService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('InsumoService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database conected');


  }
  create(dto: CreateInsumoDto) {
    const { proveedores, categoriaId, categoriaNombre, ...insumoData } = dto;

    return this.insumo.create({
      data: {
        ...insumoData,
        ...(categoriaId ? { categoria: { connect: { id: categoriaId } } } : {}),
        ...(!categoriaId && categoriaNombre
          ? {
            categoria: {
              connectOrCreate: {
                where: { name: categoriaNombre },
                create: { name: categoriaNombre },
              },
            },
          }
          : {}),
        ...(proveedores && proveedores.length
          ? {
            insumoProveedor: {
              create: proveedores.map((p) => ({
                proveedor: { connect: { id: p.proveedorId } },
                codigoProveedor: p.codigoProveedor,
                precioUnitario: p.precioUnitario ?? null,
              })),
            },
          }
          : {}),
      },
      include: {
        categoria: true,
        insumoProveedor: { include: { proveedor: true } },
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit, search } = paginationDto;

    // Construye el where dinámico:
    const where: Prisma.InsumoWhereInput = {
      available: true,
      ...(search
        ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
            { description: { contains: search } },
          ]
        }
        : {}
      )
    };


    const totalPage = await this.insumo.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPage / limit);

    return {
      data: await this.insumo.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          insumoProveedor: true
        }
      }),
      meta: {
        page: page,
        total: totalPage,
        lastPage
      }

    };
  }


  async findAllNotfilters() {


    // Construye el where dinámico:


    return {
      data: await this.insumo.findMany(),
    };
  }

  async findOne(id: number) {

    const insumo = await this.insumo.findUnique({
      where: {
        id,
        available: true
      },
      include: {
        insumoProveedor: {
          include: {
            proveedor: true,
          }
        },
        categoria: {
          select: {
            name: true,
          }
        }
      }
    })

    if (!insumo) {
      throw new RpcException({
        message: `Insunmo with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return insumo;

  }

  async update(id: number, dto: UpdateInsumoDto) {
    await this.findOne(id);

    const {
      proveedores,
      categoriaId,
      categoriaNombre,
      id: _omit,            // <- fuera
      ...scalars
    } = dto;

    // Armá el bloque de categoría
    const categoriaBlock =
      categoriaId
        ? { categoria: { connect: { id: categoriaId } } }
        : (categoriaNombre
          ? {
            categoria: {
              connectOrCreate: {
                where: { name: categoriaNombre },
                create: { name: categoriaNombre },
              },
            },
          }
          : {});

    // Armá el bloque de proveedores (relación)
    const proveedoresBlock = proveedores
      ? {
        insumoProveedor: {
          deleteMany: {}, // limpia relaciones actuales
          create: proveedores.map((p) => ({
            proveedor: { connect: { id: p.proveedorId } },
            codigoProveedor: p.codigoProveedor,
            // si la columna es opcional, mejor omitir cuando no venga
            ...(p.precioUnitario !== undefined
              ? { precioUnitario: p.precioUnitario }
              : {}),
          })),
        },
      }
      : {};

    // Armá data sólo con campos válidos:
    const data: Prisma.InsumoUpdateInput = {
      // scalars del insumo (name, code, description, minimunStock, available, etc.)
      ...(scalars.name !== undefined ? { name: scalars.name } : {}),
      ...(scalars.code !== undefined ? { code: scalars.code } : {}),
      ...(scalars.description !== undefined ? { description: scalars.description } : {}),
      ...(scalars.minimunStock !== undefined ? { minimunStock: scalars.minimunStock } : {}),
      ...(scalars.available !== undefined ? { available: scalars.available } : {}),
      ...(scalars.isInventoriable !== undefined ? { isInventoriable: scalars.isInventoriable } : {}),
      ...(scalars.sinonimo !== undefined ? { sinonimo: scalars.sinonimo } : {}),
      ...(scalars.imagenUrl !== undefined ? { imagenUrl: scalars.imagenUrl } : {}),
      ...(scalars.unidad !== undefined ? { unidad: scalars.unidad } : {}),

      // relaciones
      ...categoriaBlock,
      ...proveedoresBlock,
    };

    return this.insumo.update({
      where: { id },
      data,
      include: this.getIncludeRelations(),
    });
  }

  async validateProducts(ids: number[]) {

    ids = Array.from(new Set(ids));

    const insumos = await this.insumo.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if (insumos.length != ids.length) {
      throw new RpcException({
        message: 'Some insumos were not found',
        status: HttpStatus.BAD_REQUEST
      })
    }
    return insumos;
  }


  async findInsumos(params: {
    tipoInsumo?: string;
    categoria?: string;
    termino?: string;
  }) {
    const condiciones: Prisma.InsumoWhereInput[] = [];

    if (params.tipoInsumo) {
      condiciones.push(this.buildTipoInsumoCondition(params.tipoInsumo));
    }

    if (params.categoria) {
      condiciones.push(this.buildCategoriaCondition(params.categoria));
    }

    if (params.termino) {
      condiciones.push(this.buildTerminoCondition(params.termino));
    }

    return this.insumo.findMany({
      where: condiciones.length > 0 ? { AND: condiciones } : undefined,
      select: {
        name: true,
        id: true
      },
      orderBy: { name: 'asc' },
    });
  }

  private buildTipoInsumoCondition(tipoInsumo: string): Prisma.InsumoWhereInput {
    return {
      OR: [
        { name: { contains: tipoInsumo } },
      ]
    };
  }

  private buildCategoriaCondition(categoria: string): Prisma.InsumoWhereInput {
    return {
      OR: [
        {
          categoria: {
            name: {
              contains: categoria,
            }
          }
        },
        { name: { contains: categoria } },
      ]
    };
  }

  private buildTerminoCondition(termino: string): Prisma.InsumoWhereInput {
    return {
      OR: [
        { name: { contains: termino } },
        {
          categoria: {
            name: {
              contains: termino,
            }
          }
        },
        { code: { contains: termino } }
      ]
    };
  }

  private getIncludeRelations(): Prisma.InsumoInclude {
    return {
      categoria: true,
      insumoProveedor: {
        include: {
          proveedor: true
        }
      }
    };
  }

  getCategoriasInsumo(){
    return this.insumoCategoria.findMany();
  }
}
