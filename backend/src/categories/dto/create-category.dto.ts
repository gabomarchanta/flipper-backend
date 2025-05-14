// backend/src/categories/dto/create-category.dto.ts
import { IsNotEmpty, IsString, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  @IsString()
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres.'})
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  // @IsSlug() // class-validator no tiene @IsSlug por defecto, podrías crear un decorador custom o usar regex
  // Ejemplo con regex (simple, ajusta según necesidad):
  // @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'El slug solo puede contener letras minúsculas, números y guiones.'})
  slug?: string;
}