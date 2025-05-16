// backend/src/products/dto/create-product-variant.dto.ts
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, MaxLength, IsUUID } from 'class-validator';

export class CreateProductVariantDto {
  @IsNotEmpty() // Asumiendo que una variante siempre tiene color
  @IsUUID()
  colorId: string; // Ahora se espera el ID del color

  // ELIMINA o comenta color_name SI USAS colorId:
  // @IsNotEmpty()
  // @IsString()
  // @MaxLength(50)
  // color_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  size: string;

  @IsNumber()
  @Min(0)
  stock_quantity: number;

  @IsOptional()
  @IsNumber()
  additional_price?: number;
}