// backend/src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
// Importa el DTO de CREACIÓN para las variantes si al actualizar el producto,
// las variantes que envías son para crear nuevas o reemplazar.
import { CreateProductVariantDto } from './create-product-variant.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // Si 'variants' aquí es para definir un NUEVO conjunto de variantes (reemplazando las antiguas)
  // o para añadir variantes (si la lógica del servicio lo maneja así)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto) // Usa CreateProductVariantDto
  // @ArrayMinSize(1) // Podría ser opcional
  variants?: CreateProductVariantDto[]; // Cambiado a CreateProductVariantDto[]
}