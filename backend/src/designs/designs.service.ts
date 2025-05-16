// backend/src/designs/designs.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from './entities/design.entity';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { FilesService } from '../common/files/files.service'; // Importa FilesService

@Injectable()
export class DesignsService {
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

  async update(id: string, updateDesignDto: UpdateDesignDto /*, file?: Express.Multer.File */): Promise<Design> {
    // La actualización de la imagen es más compleja:
    // 1. ¿Se proporciona un nuevo archivo?
    // 2. Si sí, subir el nuevo archivo a S3.
    // 3. Borrar el archivo antiguo de S3 (usando design.imageKey).
    // 4. Actualizar imageUrl e imageKey en la BD.
    // Por ahora, solo actualizaremos los campos de texto.
    const design = await this.findOne(id);
    
    this.designRepository.merge(design, updateDesignDto); // Aplica cambios del DTO

    try {
        return await this.designRepository.save(design);
    } catch (error) {
        throw new InternalServerErrorException('Error al actualizar el diseño.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const design = await this.findOne(id);
    // Antes de borrar de la BD, borrar de S3
    if (design.imageKey) {
      // await this.filesService.deletePublicFile(design.imageKey); // Implementar delete en FilesService
      // Por ahora, solo log para recordatorio:
      console.log(`Recordatorio: Implementar borrado de S3 para imageKey: ${design.imageKey}`);
    }

    const result = await this.designRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Diseño con ID "${id}" no encontrado para eliminar.`);
    }
    return { message: `Diseño con ID "${id}" eliminado correctamente.` };
  }
}