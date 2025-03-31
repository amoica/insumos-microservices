import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";
import { CreateSckidSectionDto } from "./create-skid-section.dto";

export class CreateProductoFabricadoDto {
    @IsString()
    nombre:string;

    @IsString()
    codigo: string;

    @IsString()
    imagen: string;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateSckidSectionDto)
    secciones: CreateSckidSectionDto[]
}
