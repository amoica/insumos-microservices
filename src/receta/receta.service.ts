import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RecetaService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('RecetaService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }


  create(createRecetaDto: CreateRecetaDto) {

    const { componentes, ...recetaDto } = createRecetaDto;

    /**
     * Aca faltaria comprobar que los componentes existan en la base de datos
     */



    return this.recetaProducto.create({
      data: {
        ...recetaDto,
        version: recetaDto.version ?? 1, // Ensure version is always included
        ...(componentes && componentes.length > 0
          ? {
            componentes: {
              create: componentes.map((componenteDto) => ({
                ...componenteDto
              })),
            },
          }
          : {}),
      },
      include: {
        componentes: true,
      },
    });

  }

  async findAll() {

    return {
      data: await this.recetaProducto.findMany({
        include: {
          componentes: {
            include: {
              insumo: true
            }
          }
        }
      })
    }

  }


  findRecetaByTipo(tipo: string) {
    return this.recetaProducto.findMany({
      where: { tipo },
      
    });
  }


  findOne(id: number) {
    return this.recetaProducto.findUnique({
      where: { id },
      include:{
        componentes:{
          select:{
            cantidad:true,
            insumo:{
              select:{
                id:true,
                code:true,
                name:true,
                unidad:true,
              }
            }
          }
        }
      }
    });
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto) {
    try {
      this.logger.log(`🔄 Actualizando receta con ID: ${id}`);

      // 1️⃣ Verificar si la receta existe
      const recetaExistente = await this.recetaProducto.findUnique({
        where: { id },
        include: { componentes: true } // Incluye componentes para compararlos después
      });

      if (!recetaExistente) {
        this.logger.warn(`⚠️ Receta con ID ${id} no encontrada`);
        throw new NotFoundException(`La receta con ID ${id} no existe`);
      }

      // 2️⃣ Extraer datos sin componentes
      const { componentes, ...recetaData } = updateRecetaDto;

      return await this.$transaction(async (prisma) => {
        // 3️⃣ Actualizar la receta principal
        const recetaActualizada = await prisma.recetaProducto.update({
          where: { id },
          data: {
            ...recetaData,
            updatedAt: new Date() // Mantiene la fecha de actualización
          },
        });

        if (componentes) {
          // Obtener IDs de componentes previos
          const existingComponentIds = recetaExistente.componentes.map(comp => comp.id);

          // Filtrar los nuevos componentes y los que deben eliminarse
          const nuevosComponentes = componentes.filter(comp => !comp.id);
          const componentesActualizados = componentes.filter(comp => comp.id && existingComponentIds.includes(comp.id));
          const componentesEliminados = existingComponentIds.filter(id => !componentes.some(comp => comp.id === id));

          // Eliminar componentes que ya no están en la actualización
          if (componentesEliminados.length > 0) {
            await prisma.componenteProducto.deleteMany({
              where: { id: { in: componentesEliminados } },
            });
          }

          // Actualizar los componentes existentes
          if (componentesActualizados.length > 0) {
            await Promise.all(
              componentesActualizados.map(componente =>
                prisma.componenteProducto.update({
                  where: { id: componente.id },
                  data: { cantidad: componente.cantidad, insumoId: componente.insumoId },
                })
              )
            );
          }

          // Agregar nuevos componentes (optimizado)
          if (nuevosComponentes.length > 0) {
            await prisma.componenteProducto.createMany({
              data: nuevosComponentes.map(comp => ({
                recetaProductoId: id,
                insumoId: comp.insumoId,
                cantidad: comp.cantidad,
              })),
            });
          }
        }

        this.logger.log(`Receta con ID ${id} actualizada correctamente`);

        // 7️⃣ Retornar la receta actualizada con sus nuevos componentes
        return prisma.recetaProducto.findUnique({
          where: { id },
          include: { componentes: true },
        });
      });

    } catch (error) {
      this.logger.error(`Error actualizando receta con ID ${id}: ${error.message}`);
      throw new BadRequestException(error.message || 'Error al actualizar la receta');
    }
  }



  remove(id: number) {
    return `This action removes a #${id} receta`;
  }
}
