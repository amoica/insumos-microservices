import { Module } from '@nestjs/common';
import { YacimientoService } from './yacimiento.service';
import { YacimientoController } from './yacimiento.controller';

@Module({
  controllers: [YacimientoController],
  providers: [YacimientoService],
})
export class YacimientoModule {}
