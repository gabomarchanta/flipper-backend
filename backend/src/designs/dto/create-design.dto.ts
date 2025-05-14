// backend/src/designs/dto/create-design.dto.ts
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateDesignDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // El archivo se manejará a través de @UploadedFile() en el controlador, no directamente en el DTO
}