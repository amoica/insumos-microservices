import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateContactoDto {
    @IsString()
    nombre: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsString()
    cargo?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;

    // Si deseas crear contacto para un cliente o proveedor
    @IsOptional()
    clienteId?: number;

    @IsOptional()
    proveedorId?: number;
}
