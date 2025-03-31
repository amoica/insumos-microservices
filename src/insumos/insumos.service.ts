import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { PrismaClient } from '@prisma/client';
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

    const {proveedores, ...inusumoData} = createInsumoDto;


    return this.insumo.create({
      data: {
        ...inusumoData,
        ...(proveedores && {
          insumoProveedor: {
            create: proveedores.map((prov)=>({
              proveedor: {connect: {id: prov.proveedorId}},
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

    const {page, limit} = paginationDto;


    const totalPage = await this.insumo.count({where:{available:true}});
    const lastPage = Math.ceil(totalPage / limit);

    return {
      data: await this.insumo.findMany({
      skip:(page-1) * limit,
      take:limit,
      where:{
        available:true,
      },
      include:{
        insumoProveedor:true
      }
    }),
    meta:{
      page:page,
      total:totalPage,
      lastPage
    }

  };
  }

  async findOne(id: number) {

    const insumo = await this.insumo.findUnique({
      where: {
        id,
        available:true
      },
      include:{
        insumoProveedor:{
          include:{
            proveedor:true
          }
        }
      }
    })

    if(!insumo){
      throw new RpcException({
        message:`Insunmo with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return insumo;

  }

  async update(id: number, updateInsumoDto: UpdateInsumoDto) {

    const {id: __, ...data} = updateInsumoDto;

    await this.findOne(id);

    const updateInsumo = await this.insumo.update({
      where:{id},
      data:data
    })

    return updateInsumo;
  }

  async remove(id: number) {

    await this.findOne(id);
    const insumo = await this.insumo.update({
      where:{id},
      data:{
        available : false
      }
    })
    return insumo;
  }

  async validateProducts(ids: number[]){
    
    ids = Array.from(new Set(ids));

    const insumos = await this.insumo.findMany({
      where: {
        id: {
          in:ids
        }
      }
    });

    if(insumos.length != ids.length){
      throw new RpcException({
        message: 'Some insumos were not found',
        status: HttpStatus.BAD_REQUEST
      })
    }
    return insumos;
  }
}
