import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
  create(createInsumoDto: CreateInsumoDto) {

    // Separamos los datos del insumo y, si existen, la relación con proveedores

    const { proveedores, ...inusumoData } = createInsumoDto;


    return this.insumo.create({
      data: {
        ...inusumoData,
        ...(proveedores && {
          insumoProveedor: {
            create: proveedores.map((prov) => ({
              proveedor: { connect: { id: prov.proveedorId } },
              codigoProveedor: prov.codigoProveedor,

              //El precio puede quedar nulo
              precioUnitario: prov.precioUnitario
            }))
          }
        }
        )
      }
    })
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

  async update(id: number, updateInsumoDto: UpdateInsumoDto) {
    // Separamos la lista de proveedores de los demás datos
    const { proveedores, id: __, ...data } = updateInsumoDto;

    // Nos aseguramos de que el insumo existe
    await this.findOne(id);

    // Actualizamos el insumo y reemplazamos la relación de proveedores
    const updateInsumo = await this.insumo.update({
      where: { id },
      data: {
        ...data,
        insumoProveedor: {
          // Eliminamos las relaciones actuales
          deleteMany: {},
          // Creamos las nuevas relaciones
          create: proveedores ? proveedores.map((prov) => ({
            proveedor: { connect: { id: prov.proveedorId } },
            codigoProveedor: prov.codigoProveedor,
            precioUnitario: prov.precioUnitario,
          })) : [],
        },
      },
    });

    return updateInsumo;
  }

  async remove(id: number) {

    await this.findOne(id);
    const insumo = await this.insumo.update({
      where: { id },
      data: {
        available: false
      }
    })
    return insumo;
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
}
