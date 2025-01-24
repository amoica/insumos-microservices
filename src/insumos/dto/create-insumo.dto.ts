import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsString, Min } from "class-validator";

export class CreateInsumoDto {

    @IsString()
    public name: string;


    @IsString()
    public code: string;          // Código del insumo

    @IsString()
    public description: string;   // Descripción del insumo

    @IsString()
    public condition: string;     // Estado del insumo (nuevo, usado)

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    public minimunStock: number; // minimo del producto para generar alerta

    @IsBoolean()
    public available: boolean 

}
