import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ClienteService extends PrismaClient implements OnModuleInit {


  private readonly logger = new Logger('ClienteService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database conected');
  }

  create(dto: CreateClienteDto) {

    const { contactos, ...clienteData } = dto;

    return this.cliente.create({
      data: {
        ...clienteData,
        ...(contactos && contactos.length > 0
          ? {
            contactos: {
              create: contactos.map((contactoDto) => ({
                ...contactoDto
              })),
            },
          }
          : {}),
      },
      // Opcionalmente incluimos contactos en la respuesta
      include: {
        contactos: true,
      },
    });
  }


  findAll() {
    return this.cliente.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        celular: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        codigoPostal: true,
        cuit: true,
        condicionFiscal: true,
        tipoCliente: true,
        observaciones: true,
        // contactos completos (pero tú decides qué campos)
        contactos: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            // … demás campos de Contacto …
          }
        }
        // NOTA: omites createdAt, updatedAt, etc.
      }
    });
  }

  findOne(id: number) {
    return this.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        celular: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        codigoPostal: true,
        cuit: true,
        condicionFiscal: true,
        tipoCliente: true,
        observaciones: true,
        contactos: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
          }
        }
      }
    });
  }

  update(id: number, dto: UpdateClienteDto) {
    const { contactos, ...clienteData } = dto;

    return this.cliente.update({
      where: { id },
      data: {
        ...clienteData,
        // Borra los contactos actuales y crea los nuevos
        contactos: {
          deleteMany: {},                // elimina todos
          create: contactos?.map(c => ({ // crea los que vienen
            nombre: c.nombre,
            email: c.email,
            telefono: c.telefono,
            // …otros campos…
          })) ?? []
        }
      },
      include: { contactos: true }
    });
  }
  remove(id: number) {

    return this.cliente.delete({
      where: {
        id
      }
    })

  }
}
