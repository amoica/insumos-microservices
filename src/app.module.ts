import { Module } from '@nestjs/common';
import { InsumosModule } from './insumos/insumos.module';
import { DepositosModule } from './depositos/depositos.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ContactoModule } from './contacto/contacto.module';


@Module({
  imports: [InsumosModule, DepositosModule, ClienteModule, ProveedorModule, ContactoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
