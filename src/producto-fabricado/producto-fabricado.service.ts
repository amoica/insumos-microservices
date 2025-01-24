import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateProductoFabricadoDto } from './dto/create-producto-fabricado.dto';
import { UpdateProductoFabricadoDto } from './dto/update-producto-fabricado.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductoFabricadoService extends PrismaClient implements OnModuleInit {


  onModuleInit() {
    this.$connect();
  }

  async create(createProductoFabricadoDto: CreateProductoFabricadoDto) {
    const { name, code, description, componentes } = createProductoFabricadoDto;

    // verificar si el codigo es unico

    const existe = await this.productoFabricado.findUnique({ where: { code } });
    if (existe) {
      throw new RpcException({
        message: `El código del producto ya existe`,
        status: HttpStatus.BAD_REQUEST
      })
    }


    //Crear el producto fabricado y sus componentes

    return this.productoFabricado.create({
      data: {
        name,
        code,
        description,
        componentes: {
          create: componentes.map((componente) => ({
            insumoId: componente.insumoId,
            cantidad: componente.cantidad,
            unidad: componente.unidad
          }))
        }
      },
      include: { componentes: true }
    });

  }

  findAll() {
    return this.productoFabricado.findMany({
      include: { 
        componentes: {
          include: {
            insumo: {
              select:{
                name:true
              }
            }
          }
        }
       },
    });
  }

  async findOne(id: number) {
    const producto = await this.productoFabricado.findUnique({
      where: { id },
      include: { 
        componentes: {
          include: {
            insumo: {
              select:{
                name:true
              }
            }
          }
        }
       },
    });

    if (!producto) {
      throw new RpcException({
        message: `Producto fabricado con ID ${id} no encontrado`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return producto;
  }

  async update(updateProductoFabricadoDto: UpdateProductoFabricadoDto) {
    const {id, name, description, componentes} = updateProductoFabricadoDto;

    const producto = await this.findOne(id);

    if(!producto){
      throw new RpcException({
        message: `Producto fabricado con ID ${id} no encontrado`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const updateData: any = {};

    if(name) updateData.name = name;
    if(description) updateData.description = description;

    // Actualizar el producto fabricado

    return this.productoFabricado.update({
      where: {id},
      data:{
        ...updateData,
        componentes: {
          deleteMany:{},
          create: componentes || []
        }
      },
      include: {
        componentes:true
      }
    })

  }

  async remove(id: number) {
    const producto = await this.findOne(id);

    return this.productoFabricado.delete({
      where: {id: producto.id}
    })
  }
}
