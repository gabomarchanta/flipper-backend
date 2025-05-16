// backend/src/colors/dto/create-color.dto.ts
import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class CreateColorDto {
  @IsNotEmpty({ message: 'El nombre del color es requerido.' })
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty({ message: 'El código hexadecimal es requerido.' })
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}){1,2}$/, { // Valida formato #RGB o #RRGGBB
    message: 'El código hexadecimal debe tener un formato válido (ej: #F00 o #FF0000).',
  })
  hex_code: string;
}