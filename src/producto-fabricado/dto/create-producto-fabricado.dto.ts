import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested } from "class-validator";
import { CreateSckidSectionDto } from "./create-skid-section.dto";
import { TipoProductoFabricado } from "@prisma/client";



export class CreateProductoFabricadoDto {
    @IsString()
    nombre:string;

    @IsString()
    codigo: string;

    @IsString()
    imagen: string;

    @IsNumber()
    lts: number;

    @IsEnum(TipoProductoFabricado)
    tipo: TipoProductoFabricado;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateSckidSectionDto)
    secciones: CreateSckidSectionDto[]
}
