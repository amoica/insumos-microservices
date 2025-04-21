import { Module } from '@nestjs/common';
import { InsumosModule } from './insumos/insumos.module';
import { DepositosModule } from './depositos/depositos.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ContactoModule } from './contacto/contacto.module';
import { RecetaModule } from './receta/receta.module';
import { ProductoFabricadoModule } from './producto-fabricado/producto-fabricado.module';
import { OrdenFabricacionModule } from './orden-fabricacion/orden-fabricacion.module';


@Module({
  imports: [InsumosModule, DepositosModule, ClienteModule, ProveedorModule, ContactoModule, RecetaModule, ProductoFabricadoModule, OrdenFabricacionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
