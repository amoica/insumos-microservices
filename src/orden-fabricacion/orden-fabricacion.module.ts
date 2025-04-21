import { Module } from '@nestjs/common';
import { OrdenFabricacionService } from './orden-fabricacion.service';
import { OrdenFabricacionController } from './orden-fabricacion.controller';

@Module({
  controllers: [OrdenFabricacionController],
  providers: [OrdenFabricacionService],
})
export class OrdenFabricacionModule {}
