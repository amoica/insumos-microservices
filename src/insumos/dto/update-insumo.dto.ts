import { PartialType } from '@nestjs/mapped-types';
import { CreateInsumoDto } from './create-insumo.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateInsumoDto extends PartialType(CreateInsumoDto) {
    @IsNumber()
    @IsPositive()
    id:number;
}
