import { Type } from 'class-transformer';
import { IsDate, IsInt, IsString, Min } from 'class-validator';


export class CreateOrdenFabricacionDto {
    @IsInt()
    productoFabricadoId: number;
  
    @IsInt()
    @Min(1)
    cantidad: number;
  
    @IsString()
    observaciones?: string;

    @IsDate()
    @Type(() => Date) // Convierte la cadena a una instancia de Date automáticamente
    fechaEntrega: Date;
}
