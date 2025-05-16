// backend/src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from '../categories/entities/category.entity'; // Para validar/usar en ProductService
import { Design } from '../designs/entities/design.entity';       // Para validar/usar en ProductService
import { Color } from '../colors/entities/color.entity';         // Para validar/usar en ProductService
import { AuthModule } from '../auth/auth.module';                 // Para Guards
import { FilesModule } from '../common/files/files.module';     // Si ProductService usa FilesService para mockups

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      Category, // Necesario para que ProductService pueda inyectar CategoryRepository
      Design,   // Necesario para que ProductService pueda inyectar DesignRepository
      Color,    // Necesario para que ProductService pueda inyectar ColorRepository
    ]),
    AuthModule,  // Para usar AuthGuard y RolesGuard
    FilesModule, // Si ProductService o un futuro MockupService lo necesita
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Exportar si otros módulos necesitan el servicio de productos
})
export class ProductsModule {}