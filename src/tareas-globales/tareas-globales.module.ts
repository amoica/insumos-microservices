import { Module } from '@nestjs/common';
import { TareasGlobalesService } from './tareas-globales.service';
import { TareasGlobalesController } from './tareas-globales.controller';

@Module({
  controllers: [TareasGlobalesController],
  providers: [TareasGlobalesService],
})
export class TareasGlobalesModule {}
