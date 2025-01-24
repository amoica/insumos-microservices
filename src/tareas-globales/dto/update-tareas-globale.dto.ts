import { PartialType } from '@nestjs/mapped-types';
import { CreateTareaGlobalDto } from './create-tareas-globale.dto';
import { IsNumber } from 'class-validator';

export class UpdateTareaGlobalDto extends PartialType(CreateTareaGlobalDto) {
  // Extiende de CreateTareaGlobalDto para soportar actualizaciones parciales

  @IsNumber()
  id: number
}