// backend/src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, MaxLength, IsUUID, ValidateNested, ArrayMinSize, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer'; // Necesario para @ValidateNested con arrays
import { CreateProductVariantDto } from './create-product-variant.dto';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  base_price: number;

  @IsOptional() // Hacer opcional para poder crear producto y luego asignar categoría/diseño
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  designId?: string;

  @IsArray()
  @ValidateNested({ each: true }) // Valida cada objeto en el array
  @Type(() => CreateProductVariantDto) // Especifica el tipo para la validación anidada
  @ArrayMinSize(1, { message: 'Debe haber al menos una variante de producto.'})
  variants: CreateProductVariantDto[];
  
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}