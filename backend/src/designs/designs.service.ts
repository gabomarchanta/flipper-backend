// backend/src/designs/designs.service.ts
import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from './entities/design.entity';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { FilesService } from '../common/files/files.service'; // Importa FilesService

@Injectable()
export class DesignsService {
  private readonly logger = new Logger(DesignsService.name);
  constructor(
    @InjectRepository(Design)
    private readonly designRepository: Repository<Design>,
    private readonly filesService: FilesService, // Inyecta FilesService
  ) {}

  async create(
    createDesignDto: CreateDesignDto,
    file: Express.Multer.File, // El archivo subido
  ): Promise<Design> {
    if (!file) {
      
      throw new InternalServerErrorException('No se proporcionó un archivo de diseño.');
    }

    const { url: imageUrl, key: imageKey } = await this.filesService.uploadPublicFile(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    const design = this.designRepository.create({
      ...createDesignDto,
      imageUrl,
      imageKey,
    });

    try {
      return await this.designRepository.save(design);
    } catch (error) {
      // Si falla el guardado en BD, podríamos considerar borrar el archivo de S3
      // await this.filesService.deletePublicFile(imageKey); // Implementar si es necesario
      throw new InternalServerErrorException('Error al crear el diseño.');
    }
  }

  async findAll(): Promise<Design[]> {
    return this.designRepository.find();
  }

  async findOne(id: string): Promise<Design> {
    const design = await this.designRepository.findOne({ where: { id } });
    if (!design) {
      throw new NotFoundException(`Diseño con ID "${id}" no encontrado.`);
    }
    return design;
  }

  async update(
    id: string,
    updateDesignDto: UpdateDesignDto,
    file?: Express.Multer.File, // Añadir parámetro opcional para el nuevo archivo
  ): Promise<Design> {
    const design = await this.findOne(id); // findOne ya lanza NotFoundException si no existe

    let newImageUrl: string | undefined = design.imageUrl;
    let newImageKey: string | undefined = design.imageKey;

    if (file) {
      // 1. Subir el nuevo archivo a S3
      this.logger.log(`Actualizando imagen para el diseño ID: ${id}`);
      const { url, key } = await this.filesService.uploadPublicFile(
        file.buffer,
        file.mimetype,
        file.originalname,
      );
      newImageUrl = url;
      newImageKey = key;

      // 2. (Importante) Borrar el archivo antiguo de S3 si existía
      if (design.imageKey) {
        try {
          // Necesitarías un método deletePublicFile en tu FilesService
          // await this.filesService.deletePublicFile(design.imageKey);
          this.logger.log(`TODO: Implementar borrado de S3 para la clave antigua: ${design.imageKey}`);
        } catch (error) {
          this.logger.error(`Error al borrar el archivo antiguo de S3: ${design.imageKey}`, error);
          // Decide si continuar o lanzar un error. Por ahora, continuamos.
        }
      }
    }

    // Aplicar cambios del DTO
    // Y aplicar las nuevas URL/clave de imagen SOLO SI se subió un archivo nuevo
    const dataToUpdate: Partial<Design> = { ...updateDesignDto };
    if (file) { // Solo actualiza los campos de imagen si se proporcionó un nuevo archivo
        dataToUpdate.imageUrl = newImageUrl;
        dataToUpdate.imageKey = newImageKey;
    }
    
    this.designRepository.merge(design, dataToUpdate);

    try {
      return await this.designRepository.save(design);
    } catch (error) {
      this.logger.error(`Error al actualizar el diseño ${id}:`, error.stack);
      if (file && newImageKey) {
        // await this.filesService.deletePublicFile(newImageKey); // Considerar borrar si falla el save
        this.logger.warn(`El guardado en BD falló después de subir el nuevo archivo a S3 (clave: ${newImageKey}).`);
      }
      throw new InternalServerErrorException('Error al actualizar el diseño.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const design = await this.findOne(id);
    // Antes de borrar de la BD, borrar de S3
    if (design.imageKey) {
      // await this.filesService.deletePublicFile(design.imageKey); // Implementar delete en FilesService
      this.logger.log(`TODO: Implementar borrado de S3 para imageKey: ${design.imageKey} al eliminar diseño ${id}`);
    }

    const result = await this.designRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Diseño con ID "${id}" no encontrado para eliminar.`);
    }
    this.logger.log(`Diseño con ID "${id}" eliminado correctamente.`);
    return { message: `Diseño con ID "${id}" eliminado correctamente.` };
  }
}