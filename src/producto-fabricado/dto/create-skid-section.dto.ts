import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateSkidSectionItemDto } from "./create-skids-section-item.dto";

export class CreateSckidSectionDto{
    
    @IsOptional()
    @IsString()
    nombre: String

    @IsOptional()
    @IsNumber()
    baseComponenteId: number

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateSkidSectionItemDto)
    items: CreateSkidSectionItemDto[]
}