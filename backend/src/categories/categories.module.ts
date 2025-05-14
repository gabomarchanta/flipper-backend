// backend/src/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { AuthModule } from '../auth/auth.module'; // Importa AuthModule para usar sus guards/passport

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AuthModule, // Para que los guards de AuthModule estén disponibles
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService], // Exporta el servicio si otros módulos lo necesitan
})
export class CategoriesModule {}