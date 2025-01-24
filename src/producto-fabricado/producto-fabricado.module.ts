import { Module } from '@nestjs/common';
import { ProductoFabricadoService } from './producto-fabricado.service';
import { ProductoFabricadoController } from './producto-fabricado.controller';

@Module({
  controllers: [ProductoFabricadoController],
  providers: [ProductoFabricadoService],
})
export class ProductoFabricadoModule {}
