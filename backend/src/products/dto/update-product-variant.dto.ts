// backend/src/products/dto/update-product-variant.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantDto } from './create-product-variant.dto';

export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) {
  // Puedes añadir campos específicos para la actualización si es necesario,
  // por ejemplo, si quieres forzar que ciertos campos no se puedan actualizar
  // o si el DTO de creación tiene campos que no aplican a la actualización.
}