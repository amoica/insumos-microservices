import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class DepositosService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('DepositoService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database conected');

  }


  async create(createDepositoDto: CreateDepositoDto) {
    
    try {
      return await this.deposito.create({data: createDepositoDto})
    } catch (error) {
      throw new RpcException({
        message: `Error al crear el Deposito`,
        status: HttpStatus.BAD_REQUEST
      })
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {page, limit} = paginationDto;

    const totalPage = await this.deposito.count({where: {available:true}});

    const lastPage = Math.ceil(totalPage / limit);

    return {
      data: await this.deposito.findMany({
        skip: (page-1) * limit,
        take: limit,
        where:{
          available: true
        }
      }),
      meta:{
        page: page,
        total: totalPage,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const deposito = await this.deposito.findUnique({
      where: {
        id,
        available: true
      }
    })

    if(!deposito){
      throw new RpcException({
        message: `Deposito con id ${id} no se encuentra`
      })
    }

    return deposito;
  }

  async update(id: number, updateDepositoDto: UpdateDepositoDto) {
    const {id: __, ...data} = updateDepositoDto

    await this.findOne(id);

    console.log(id);
    console.log(updateDepositoDto);

    const updateDeposito = await this.deposito.update({
      where:{id},
      data: data
    })

    return updateDeposito;
  }

  async remove(id: number) {
    await this.findOne(id);

    const deposito = await this.deposito.update({
      where: {id},
      data:{
        available: false
      }
    });

    return deposito;
  }

}
