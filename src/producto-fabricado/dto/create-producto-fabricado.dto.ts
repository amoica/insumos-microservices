import { IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateComponenteDto } from './create-componente.dto';

export class CreateProductoFabricadoDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateComponenteDto)
    componentes: CreateComponenteDto[];
}
