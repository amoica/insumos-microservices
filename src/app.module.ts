import { Module } from '@nestjs/common';
import { InsumosModule } from './insumos/insumos.module';
import { DepositosModule } from './depositos/depositos.module';
import { OrdenFabricacionModule } from './orden-fabricacion/orden-fabricacion.module';
import { ProductoFabricadoModule } from './producto-fabricado/producto-fabricado.module';
import { ReservasModule } from './reservas/reservas.module';
import { MovimientoModule } from './movimiento/movimiento.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedorModule } from './proveedor/proveedor.module';


@Module({
  imports: [InsumosModule, DepositosModule, OrdenFabricacionModule, ProductoFabricadoModule, ReservasModule, MovimientoModule, ClienteModule, ProveedorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
