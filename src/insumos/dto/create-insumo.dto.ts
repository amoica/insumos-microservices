import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { CreateInsumoProveedorDto } from "./create-insumo-proveedor.dto";

export class CreateInsumoDto {

    @IsString()
    public name: string;

    @IsString()
    public code: string;          // Código del insumo

    @IsString()
    @IsOptional()
    public description: string;   // Descripción del insumo

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    public minimunStock: number; // minimo del producto para generar alerta

    @IsBoolean()
    @IsOptional()
    public available: boolean 

    @IsBoolean()
    @IsOptional()
    public isInventoriable: boolean

    @IsString()
    public sinonimo: string

    @IsString()
    public imagenUrl: string

    @IsString()
    public unidad:string

    // Propiedad que relaciona proveedor y su código

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateInsumoProveedorDto)
    public proveedores: CreateInsumoProveedorDto[];

}
