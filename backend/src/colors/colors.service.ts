// backend/src/colors/colors.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './entities/color.entity';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColorsService {
  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  async create(createColorDto: CreateColorDto): Promise<Color> {
    const { name, hex_code } = createColorDto;
    // Normalizar hex_code a mayúsculas para consistencia en la BD
    const normalizedHexCode = hex_code.toUpperCase();

    const existing = await this.colorRepository.findOne({
      where: [{ name }, { hex_code: normalizedHexCode }],
    });
    if (existing) {
      if (existing.name === name) {
        throw new ConflictException(`Un color con el nombre "${name}" ya existe.`);
      }
      if (existing.hex_code === normalizedHexCode) {
        throw new ConflictException(`Un color con el código hexadecimal "${normalizedHexCode}" ya existe.`);
      }
    }

    const color = this.colorRepository.create({ ...createColorDto, hex_code: normalizedHexCode });
    try {
      return await this.colorRepository.save(color);
    } catch (error) {
      if (error.code === '23505') {
         throw new ConflictException('Error: El nombre o código hexadecimal del color ya existe.');
      }
      throw new InternalServerErrorException('Error al crear el color.');
    }
  }

  async findAll(): Promise<Color[]> {
    return this.colorRepository.find();
  }

  async findOne(id: string): Promise<Color> {
    const color = await this.colorRepository.findOne({ where: { id } });
    if (!color) {
      throw new NotFoundException(`Color con ID "${id}" no encontrado.`);
    }
    return color;
  }

  async update(id: string, updateColorDto: UpdateColorDto): Promise<Color> {
    const color = await this.colorRepository.preload({
      id: id,
      ...updateColorDto,
      // Normalizar hex_code si se está actualizando
      ...(updateColorDto.hex_code && { hex_code: updateColorDto.hex_code.toUpperCase() }),
    });

    if (!color) {
      throw new NotFoundException(`Color con ID "${id}" no encontrado para actualizar.`);
    }

    // Verificar conflictos si se actualiza nombre o hex_code
    if (updateColorDto.name && updateColorDto.name !== color.name) {
        const existing = await this.colorRepository.findOne({ where: { name: updateColorDto.name }});
        if (existing && existing.id !== id) throw new ConflictException(`Un color con el nombre "${updateColorDto.name}" ya existe.`);
    }
    if (updateColorDto.hex_code && updateColorDto.hex_code.toUpperCase() !== color.hex_code) {
        const existing = await this.colorRepository.findOne({ where: { hex_code: updateColorDto.hex_code.toUpperCase() }});
        if (existing && existing.id !== id) throw new ConflictException(`Un color con el código hexadecimal "${updateColorDto.hex_code.toUpperCase()}" ya existe.`);
    }

    try {
      return await this.colorRepository.save(color);
    } catch (error) {
      if (error.code === '23505') {
         throw new ConflictException('Error: El nombre o código hexadecimal del color ya existe.');
      }
      throw new InternalServerErrorException('Error al actualizar el color.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.colorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Color con ID "${id}" no encontrado para eliminar.`);
    }
    return { message: `Color con ID "${id}" eliminado correctamente.`};
  }
}