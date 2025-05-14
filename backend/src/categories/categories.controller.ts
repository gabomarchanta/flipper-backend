// backend/src/categories/categories.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard'; // Crearemos este guard
import { Roles } from '../auth/decorators/roles.decorator'; // Crearemos este decorador
import { Role } from '../auth/enums/role.enum'; // Crearemos este enum

@Controller('categories')
// @UseGuards(AuthGuard('jwt'), RolesGuard) // Aplicar guards a todo el controlador
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Proteger endpoint específico
  @Roles(Role.Admin) // Solo Admins pueden crear
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    // Este endpoint podría ser público o requerir solo login, no rol de admin
    return this.categoriesService.findAll();
  }

  @Get(':idOrSlug') // Permite buscar por ID (UUID) o por slug (string)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('idOrSlug') idOrSlug: string) {
    // Este endpoint podría ser público
    return this.categoriesService.findOne(idOrSlug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin) // Solo Admins pueden actualizar
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseUUIDPipe) id: string, // Valida que 'id' sea un UUID
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin) // Solo Admins pueden eliminar
  @HttpCode(HttpStatus.NO_CONTENT) // O HttpStatus.OK con un mensaje
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
    // No es necesario devolver nada con NO_CONTENT, o puedes devolver el mensaje del servicio con OK
    // return this.categoriesService.remove(id); 
  }
}