import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductoFabricadoDto } from './dto/create-producto-fabricado.dto';
import { UpdateProductoFabricadoDto } from './dto/update-producto-fabricado.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProductoFabricadoService extends PrismaClient implements OnModuleInit {



  private productoFabricados = [];
  private readonly logger = new Logger('ProductoFabricadoService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');

  }

  async create(createProductoFabricadoDto: CreateProductoFabricadoDto) {
    try {
      const { nombre, codigo, secciones } = createProductoFabricadoDto;
      return await this.productoFabricado.create({
        data: {
          nombre,
          codigo,
          secciones: {
            create: secciones.map((seccion) => ({
              nombre: seccion.nombre,
              baseComponenteId: seccion.baseComponenteId,
              items: {
                create: seccion.items.map((item) => ({
                  insumoId: item.insumoId,
                  cantidad: item.cantidad
                })),
              },
            })),
          },
        },
      });

    } catch (error) {
      this.logger.error('Error creating ProductoFabricado', error.stack);
      throw error;
    }

  }

  async findAll() {
    try {
      return await this.productoFabricado.findMany({
        select: {
          id: true,
          nombre: true,
          codigo: true,
          descripcion: true,
          createdAt: true,
          updatedAt: true,
          // Incluimos las secciones asociadas al producto
          secciones: {
            select: {
              id: true,
              nombre: true,
              baseComponenteId: true,
              productoFabricadoId: true,
              // Incluimos los items de cada sección
              items: {
                select: {
                  id: true,
                  insumoId: true,
                  cantidad: true,
                  sectionId: true,
                  // Opcional: incluir información del insumo relacionado
                  insumo: {
                    select: {
                      name: true,
                      code: true,
                      description: true,
                      unidad: true,
                    }
                  }
                }
              }
            }
          }
        },
      });
    } catch (error) {
      this.logger.error('Error fetching all ProductoFabricado', error.stack);
      throw error;
    }
  }




// Método para obtener el detalle completo de un producto fabricado por su ID
  async findOne(id: number) {
    try {
      return await this.productoFabricado.findUnique({
        where: { id },
        include: {
          secciones: {
            include: {
              // Si tienes definida la relación para la receta base, podrías incluirla aquí:
              // baseComponente: {
              //   select: { nombre: true, codigo: true, componentes: true }
              // },
              items: {
                include: {
                  // Incluimos la información del insumo para cada ítem
                  insumo: {
                    select: {
                      name: true,
                      code: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error fetching ProductoFabricado id: ${id}`, error.stack);
      throw error;
    }
  }


  update(id: number, updateProductoFabricadoDto: UpdateProductoFabricadoDto) {
    return `This action updates a #${id} productoFabricado`;
  }

  remove(id: number) {
    return `This action removes a #${id} productoFabricado`;
  }
}
