import { IsNumber, IsString } from "class-validator";

export class CreateSkidSectionItemDto {

    @IsNumber()
    insumoId: number;

    @IsNumber()
    cantidad: number;
}