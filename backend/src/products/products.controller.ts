// backend/src/products/products.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe,
  Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
// Podrías añadir un DTO para query params si necesitas paginación/filtros complejos
// import { FindProductsQueryDto } from './dto/find-products-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(/* @Query() query: FindProductsQueryDto */) { // Descomenta query si usas DTO de query
    // Aquí podrías pasar 'query' al servicio para filtrar, paginar, ordenar
    return this.productsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT) // O HttpStatus.OK si devuelves un mensaje
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productsService.remove(id);
    // return this.productsService.remove(id); // Si quieres devolver el mensaje
  }

  // --- Endpoints Adicionales para Variantes (Opcional pero recomendado) ---
  // Si decides gestionar variantes con endpoints dedicados en lugar de a través de UpdateProductDto:

  /*
  @Post(':productId/variants')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  addProductVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() createProductVariantDto: CreateProductVariantDto, // Necesitarías este DTO
  ) {
    return this.productsService.addVariantToProduct(productId, createProductVariantDto);
  }

  @Patch(':productId/variants/:variantId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  updateProductVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto, // Necesitarías este DTO
  ) {
    return this.productsService.updateVariant(productId, variantId, updateProductVariantDto);
  }

  @Delete(':productId/variants/:variantId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProductVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.productsService.removeVariantFromProduct(productId, variantId);
  }
  */
}