import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateComponenteInsumoDto {

    @IsNumber()
    @IsOptional()
    id: number;

    @IsNumber()
    @Type(() => Number)
    insumoId: number;

    @IsNumber()
    @Type(() => Number)
    cantidad: number;

}