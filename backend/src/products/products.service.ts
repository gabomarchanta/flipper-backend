// backend/src/products/products.service.ts
import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';
import { Design } from '../designs/entities/design.entity';
import { Color } from '../colors/entities/color.entity';
import { FilesService } from '../common/files/files.service';
import * as sharp from 'sharp';
import axios from 'axios';
import * as path from 'path'; // Para construir rutas a assets locales
import * as fs from 'fs'; // Para leer el archivo base local

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly RUTA_REMERA_BASE = path.join(__dirname, '..', 'assets', 'remera-base.png');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant) // Inyectar ProductVariant si lo manejas separado
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Category) // Para validar categoryId
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Design) // Para validar designId
    private readonly designRepository: Repository<Design>,
    @InjectRepository(Color) // Si implementas entidad Color
    private readonly colorRepository: Repository<Color>,
    private readonly filesService: FilesService, // Para mockups
  ) {
    // Verificar si la remera base existe al iniciar (opcional, pero bueno para dev)
    if (!fs.existsSync(this.RUTA_REMERA_BASE)) {
        this.logger.warn(`La imagen base de la remera no se encontró en: ${this.RUTA_REMERA_BASE}`);
        // Podrías lanzar un error aquí si es crítico para el funcionamiento
    }
  }

  private async downloadImageToBuffer(url: string): Promise<Buffer> {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer', // Importante para obtener la imagen como buffer
      });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      this.logger.error(`Error al descargar imagen desde ${url}:`, error);
      throw new InternalServerErrorException(`No se pudo descargar la imagen del diseño desde ${url}`);
    }
  }

  // Helper para convertir HEX a RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
  }

  private async generateAndUploadMockup(
      designImageUrl: string,
      colorHex: string, // Nuevo parámetro para el código hexadecimal del color
  ): Promise<{ mockup_image_url?: string; mockup_image_key?: string }> {
      try {
          if (!fs.existsSync(this.RUTA_REMERA_BASE)) {
              this.logger.error(`Mockup no generado: La imagen base de la remera no se encontró en: ${this.RUTA_REMERA_BASE}`);
              return { mockup_image_url: undefined, mockup_image_key: undefined };
          }

          const designImageBuffer = await this.downloadImageToBuffer(designImageUrl);
          let baseTshirtImage = sharp(fs.readFileSync(this.RUTA_REMERA_BASE)); // Cargar la imagen base con sharp

          // --- PASO 1: Tintar la remera base ---
          const rgbColor = this.hexToRgb(colorHex);
          if (!rgbColor) {
              this.logger.warn(`Código hexadecimal de color inválido: ${colorHex}. No se aplicará tintado.`);
          } else {
              this.logger.log(`Aplicando tintado con color: ${colorHex} (RGB: ${rgbColor.r},${rgbColor.g},${rgbColor.b})`);
              // Obtener dimensiones de la remera base para crear la capa de color
              const metadata = await baseTshirtImage.metadata();
              if (metadata.width && metadata.height) {
                  // Crear una capa de color sólido
                  // La opacidad (alpha) es clave aquí. 0.3 (30%) es un punto de partida.
                  // Experimenta con este valor y con el 'blend mode'.
                  const colorLayer = await sharp({
                      create: {
                          width: metadata.width,
                          height: metadata.height,
                          channels: 4, // RGBA
                          background: { r: rgbColor.r, g: rgbColor.g, b: rgbColor.b, alpha: 0.30 }, // Ejemplo: 30% de opacidad
                      },
                  })
                  .png() // Convertir a PNG para asegurar el canal alfa
                  .toBuffer();

                  // Superponer la capa de color sobre la remera base
                  // 'multiply' suele funcionar bien para añadir color a imágenes más claras.
                  // 'overlay' o 'color' también son buenas opciones para probar.
                  baseTshirtImage = baseTshirtImage.composite([{
                      input: colorLayer,
                      blend: 'multiply', // ¡EXPERIMENTA CON ESTE VALOR! ('overlay', 'color', 'hard-light', etc.)
                  }]);
              } else {
                  this.logger.warn('No se pudieron obtener las dimensiones de la remera base para el tintado.');
              }
          }

          // --- PASO 2: Preparar y superponer el diseño ---
          // Dimensiones y posición del diseño (ajusta estos valores)
          const designWidth = 300;
          const designHeight = 300; 
          const positionTop = 150; 
          const positionLeft = 250;

          const resizedDesignBuffer = await sharp(designImageBuffer)
              .resize(designWidth, designHeight, { fit: 'inside', withoutEnlargement: true })
              .png() // Asegurar transparencia
              .toBuffer();

          // Superponer el diseño sobre la remera (ya tintada o no)
          const mockupBuffer = await baseTshirtImage // Usar la imagen base (posiblemente tintada)
              .composite([{
                  input: resizedDesignBuffer,
                  top: positionTop,
                  left: positionLeft,
              }])
              .webp({ quality: 85 }) // WebP con buena calidad
              .toBuffer();

          // --- PASO 3: Subir a S3 ---
          const { url, key } = await this.filesService.uploadPublicFile(
              mockupBuffer,
              'image/webp',
              `mockup-${Date.now()}.webp`,
          );

          this.logger.log(`Mockup generado y subido: ${url}`);
          return { mockup_image_url: url, mockup_image_key: key };

      } catch (error) {
          this.logger.error('Error al generar o subir el mockup:', error);
          return { mockup_image_url: undefined, mockup_image_key: undefined };
      }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, designId, variants: variantDtos, ...productData } = createProductDto;

    let categoryEntity: Category | undefined = undefined;
    if (categoryId) {
        categoryEntity = (await this.categoryRepository.findOne({ where: { id: categoryId } })) ?? undefined;
        if (!categoryEntity) {
            throw new BadRequestException(`Categoría con ID "${categoryId}" no encontrada.`);
        }
    }

    let designEntity: Design | undefined = undefined;
    if (designId) {
        designEntity = (await this.designRepository.findOne({ where: { id: designId } })) ?? undefined;
        if (!designEntity) {
            throw new BadRequestException(`Diseño con ID "${designId}" no encontrada.`);
        }
    }

    if (designId && !designEntity) throw new BadRequestException(`Diseño con ID "${designId}" no encontrado.`);


    // 1. Crea la instancia del producto SIN las variantes todavía
    const productToSave = this.productRepository.create({
        ...productData,
        category: categoryEntity,
        design: designEntity,
        // No asignes 'variants' aquí todavía si vas a manejar su creación explícitamente después
    });

    try {
        // 2. Guarda el producto principal PRIMERO para obtener su ID
        const savedProduct = await this.productRepository.save(productToSave);
        this.logger.log(`Producto base guardado con ID: ${savedProduct.id}`);

        // 3. Ahora crea y guarda las variantes, asociándolas al 'savedProduct' que ya tiene un ID
        const variants: ProductVariant[] = [];
        for (const variantDto of variantDtos) {
            const colorEntity = await this.colorRepository.findOne({ where: { id: variantDto.colorId } });
            if (!colorEntity) {
                // Si una variante falla, ¿qué hacemos? ¿Rollback? Por ahora lanzamos error.
                // Podríamos considerar una transacción aquí para todo el proceso.
                throw new BadRequestException(`Color con ID "${variantDto.colorId}" no encontrado para una variante del producto ${savedProduct.name}.`);
            }

            let mockupData: { mockup_image_url?: string; mockup_image_key?: string } = {};
            if (designEntity?.imageUrl && colorEntity.hex_code) { // Solo generar mockup si hay una imagen de diseño
              this.logger.log(`Generando mockup para variante: Color ${colorEntity.name}, Talle ${variantDto.size}`);
              mockupData = await this.generateAndUploadMockup(
                designEntity.imageUrl,
                colorEntity.hex_code, // Para Iteración 2
              );
            } else {
              let reason = '';
              if (!designEntity?.imageUrl) reason += 'Producto sin diseño o diseño sin imagen. ';
              if (!colorEntity.hex_code) reason += 'Color sin código hexadecimal.';
              this.logger.warn(`No se generará mockup para variante (Color ${colorEntity.name}, Talle ${variantDto.size}). Razón: ${reason.trim()}`);
            }

            const { mockup_image_url: mockupImageUrlPlaceholder, mockup_image_key: mockupImageKeyPlaceholder } = mockupData;

            const newVariant = this.productVariantRepository.create({
                ...variantDto,
                product: savedProduct, // <--- ASOCIA EL PRODUCTO YA GUARDADO (CON ID)
                productId: savedProduct.id, // <--- Asigna explícitamente el ID si es necesario (TypeORM debería manejarlo con la entidad)
                color: colorEntity,
                mockup_image_url: mockupImageUrlPlaceholder,
                mockup_image_key: mockupData.mockup_image_key,
            });
            variants.push(newVariant);
        }

        // Guarda todas las variantes creadas
        // Si 'cascade: true' está en Product.variants, guardar el producto de nuevo con las variantes
        // podría funcionar, o guardar las variantes directamente.
        // Vamos a guardar las variantes directamente para ser más explícitos.
        await this.productVariantRepository.save(variants);
        this.logger.log(`${variants.length} variantes guardadas para el producto ID: ${savedProduct.id}`);

        // Vuelve a cargar el producto con sus variantes para devolver el objeto completo
        // findOne debería cargar las variantes si 'eager: true' está en la relación.
        return this.findOne(savedProduct.id); // findOne ya tiene eager loading o relations configuradas

    } catch (error) {
        this.logger.error('Error al crear el producto o sus variantes:', error.stack);
        // Considerar borrar el producto principal si las variantes fallaron (lógica de rollback/transacción)
        throw new InternalServerErrorException('Error al crear el producto. Revisa los logs del servidor.');
    }
  }

  // async generateAndUploadMockup(designUrl: string, colorHex: string): Promise<{ mockup_image_url: string, mockup_image_key: string }> {
  //   // Lógica con sharp para crear el mockup
  //   // 1. Descargar imagen base de remera (o tenerla local/S3)
  //   // 2. Descargar imagen de diseño de designUrl
  //   // 3. Usar sharp para tintar remera base, superponer diseño
  //   // 4. Obtener el buffer del mockup
  //   // const mockupBuffer = await sharp(...).toBuffer();
  //   // const { url, key } = await this.filesService.uploadPublicFile(mockupBuffer, 'image/png', 'mockup.png');
  //   // return { mockup_image_url: url, mockup_image_key: key };
  //   this.logger.warn('Generación de mockup aún no implementada completamente.');
  //   return { mockup_image_url: 'URL_MOCKUP_GENERADA', mockup_image_key: 'KEY_MOCKUP_S3' };
  // }


  async findAll(): Promise<Product[]> {
    // Carga las relaciones definidas como eager: true en la entidad (category, design, variants)
    return this.productRepository.find({
        // relations: ['category', 'design', 'variants', 'variants.color'] // O especifica aquí si no son eager
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      // relations: ['category', 'design', 'variants', 'variants.color'], // Opcional si son eager
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // La actualización de variantes suele ser más compleja y a menudo se maneja con endpoints dedicados
    // Por ahora, actualizaremos solo los datos del producto principal.
    const { categoryId, designId, variants, ...productDataToUpdate } = updateProductDto;
    
    const product = await this.productRepository.preload({
        id: id,
        ...productDataToUpdate,
    });

    if (!product) {
        throw new NotFoundException(`Producto con ID "${id}" no encontrado para actualizar.`);
    }

    if (categoryId) {
        const foundCategory = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!foundCategory) throw new BadRequestException(`Categoría con ID "${categoryId}" no encontrada.`);
        product.category = foundCategory; // Asigna la entidad o undefined
    } else if (categoryId === null) { // Para desasociar explícitamente
        product.category = undefined; // O null si tu entidad lo permite y prefieres null
    }

    if (designId) {
        const foundDesign = await this.designRepository.findOne({ where: { id: designId } });
        if (!foundDesign) throw new BadRequestException(`Diseño con ID "${designId}" no encontrado.`);
        product.design = foundDesign;
    } else if (designId === null) {
        product.design = undefined;
    }
        
    // Lógica para actualizar variantes (más compleja, omitida por ahora para simplicidad inicial)
    // Si 'variants' viene en updateProductDto, necesitarías:
    // 1. Identificar variantes existentes, nuevas y a eliminar.
    // 2. Actualizar existentes, crear nuevas (con generación de mockup), eliminar las que no vienen.

    try {
        return await this.productRepository.save(product);
    } catch (error) {
        this.logger.error(`Error al actualizar el producto ${id}:`, error.stack);
        throw new InternalServerErrorException('Error al actualizar el producto.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    // Considerar borrar mockups de S3 para todas las variantes
    // y qué sucede con las órdenes que puedan contener este producto.
    const result = await this.productRepository.delete(id); // Esto borrará en cascada las variantes si onDelete: 'CASCADE' está en ProductVariant.product
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado para eliminar.`);
    }
    return { message: `Producto con ID "${id}" eliminado correctamente.`};
  }
}