import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { slugify } from '../common/utils/slugify'; // Crearemos esta utilidad

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, slug } = createCategoryDto;

    // Verificar si ya existe una categoría con el mismo nombre o slug
    const existingByName = await this.categoryRepository.findOne({ where: { name } });
    if (existingByName) {
      throw new ConflictException(`Una categoría con el nombre "${name}" ya existe.`);
    }

    let finalSlug = slug;
    if (slug) {
      const existingBySlug = await this.categoryRepository.findOne({ where: { slug } });
      if (existingBySlug) {
        throw new ConflictException(`Una categoría con el slug "${slug}" ya existe.`);
      }
    } else {
      // Generar slug a partir del nombre si no se proporciona
      finalSlug = slugify(name);
      const existingByGeneratedSlug = await this.categoryRepository.findOne({ where: { slug: finalSlug } });
      if (existingByGeneratedSlug) {
        // Si el slug generado ya existe, podríamos añadir un sufijo, o lanzar error
        // Por simplicidad, lanzaremos error por ahora o podríamos generar uno único.
        // Para una solución más robusta, se podría añadir un hash o un número al final.
        finalSlug = `${finalSlug}-${Date.now().toString(36)}`; // Ejemplo de slug único
      }
    }
    
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug: finalSlug,
    });

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      // Manejar errores específicos de la base de datos si es necesario
      if (error.code === '23505') { // Código de error para violación de unicidad en PostgreSQL
        throw new ConflictException('Error: El nombre o slug de la categoría ya existe.');
      }
      throw new InternalServerErrorException('Error al crear la categoría.');
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOne(idOrSlug: string): Promise<Category> {
    const options: FindOneOptions<Category> = {
      where: [{ id: idOrSlug }, { slug: idOrSlug }],
    };
    const category = await this.categoryRepository.findOne(options);
    if (!category) {
      throw new NotFoundException(`Categoría con ID o Slug "${idOrSlug}" no encontrada.`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id); // Reutiliza findOne para verificar existencia

    // Verificar conflictos de nombre/slug si se están actualizando
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingByName = await this.categoryRepository.findOne({ where: { name: updateCategoryDto.name } });
      if (existingByName && existingByName.id !== id) {
        throw new ConflictException(`Una categoría con el nombre "${updateCategoryDto.name}" ya existe.`);
      }
    }

    let finalSlug = updateCategoryDto.slug;
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingBySlug = await this.categoryRepository.findOne({ where: { slug: updateCategoryDto.slug }});
      if (existingBySlug && existingBySlug.id !== id) {
        throw new ConflictException(`Una categoría con el slug "${updateCategoryDto.slug}" ya existe.`);
      }
    } else if (updateCategoryDto.name && (!updateCategoryDto.slug || updateCategoryDto.slug === category.slug)) {
      // Si se actualiza el nombre pero no el slug, o el slug es el mismo, regenerar slug del nuevo nombre
      finalSlug = slugify(updateCategoryDto.name);
      if (finalSlug !== category.slug) { // Solo verificar si el slug realmente cambió
        const existingByGeneratedSlug = await this.categoryRepository.findOne({ where: { slug: finalSlug } });
        if (existingByGeneratedSlug && existingByGeneratedSlug.id !== id) {
          finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
        }
      }
    }


    // Mezcla los datos actuales con los nuevos. Asegúrate de que el slug se actualice.
    const updatedCategoryData = {
        ...category,
        ...updateCategoryDto,
        slug: finalSlug !== undefined ? finalSlug : category.slug, // Asegurar que el slug se mantenga o actualice
    };
    
    // TypeORM `preload` es bueno para obtener la entidad y aplicar cambios parciales
    const preloadedCategory = await this.categoryRepository.preload({
        id: id,
        ...updateCategoryDto, // Aplica los cambios del DTO
        slug: finalSlug !== undefined ? finalSlug : category.slug, // Asegúrate de que el slug se actualice o se mantenga
    });

    if (!preloadedCategory) {
        throw new NotFoundException(`Categoría con ID "${id}" no encontrada para actualizar.`);
    }

    try {
      return await this.categoryRepository.save(preloadedCategory);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Error: El nombre o slug de la categoría ya existe.');
      }
      throw new InternalServerErrorException('Error al actualizar la categoría.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id); // Verificar existencia
    // Considerar qué hacer si la categoría tiene productos asociados antes de borrarla
    // Por ahora, simplemente la eliminamos.
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Categoría con ID "${id}" no encontrada para eliminar.`);
    }
    return { message: `Categoría con ID "${id}" eliminada correctamente.` };
  }
}