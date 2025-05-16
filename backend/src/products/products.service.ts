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
// import { FilesService } from '../common/files/files.service'; // Para mockups
// import sharp from 'sharp'; // Para mockups

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

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
    // private readonly filesService: FilesService, // Para mockups
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, designId, variants: variantDtos, ...productData } = createProductDto;

    // Validar Category y Design si se proporcionan IDs
    let categoryEntity: Category | undefined = undefined; // Tipado explícito
    if (categoryId) {
      const foundCategory = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!foundCategory) { // findOne devuelve null si no encuentra
        throw new BadRequestException(`Categoría con ID "${categoryId}" no encontrada.`);
      }
      categoryEntity = foundCategory; // Asignación directa está bien porque foundCategory es Category aquí
    }
    // ... similar para design ...
    let designEntity: Design | undefined = undefined;
    if (designId) {
        const foundDesign = await this.designRepository.findOne({ where: { id: designId } });
        if (!foundDesign) {
            throw new BadRequestException(`Diseño con ID "${designId}" no encontrada.`);
        }
        designEntity = foundDesign;
    }

    const newProduct = this.productRepository.create({
      ...productData,
      category: categoryEntity, // categoryEntity ya es Category | undefined
      design: designEntity,   // designEntity ya es Design | undefined
      variants: [],
    });
    
    // Crear instancias de ProductVariant
    const productVariants: ProductVariant[] = [];
    for (const variantDto of createProductDto.variants) {
      let colorEntity: Color | undefined = undefined;
      if (variantDto.colorId) {
          const foundColor = await this.colorRepository.findOne({ where: { id: variantDto.colorId } });
          if (!foundColor) {
              throw new BadRequestException(`Color con ID "${variantDto.colorId}" no encontrado para la variante.`);
          }
          colorEntity = foundColor;
      } else {
        // Decide qué hacer si no se proporciona colorId: error o permitir variantes sin color (raro para remeras)
        throw new BadRequestException('Se requiere colorId para cada variante.');
      }
      
      // ... (lógica de mockup, usando colorEntity.hex_code si es necesario) ...
      const mockupImageUrlPlaceholder = `https://via.placeholder.com/400x400.png?text=Mockup+${colorEntity.name}+${variantDto.size}`;

      const variant = this.productVariantRepository.create({
        ...variantDto, // Esto incluirá size, stock_quantity, additional_price
        product: newProduct, // La relación se establecerá al guardar el producto con cascade
        color: colorEntity,    // Asigna la entidad Color completa
        mockup_image_url: mockupImageUrlPlaceholder,
      });
      productVariants.push(variant);
    }
    newProduct.variants = productVariants;

    try {
      // Guardar el producto. Gracias a cascade:true en la entidad Product, las variantes también se guardarán.
      return await this.productRepository.save(newProduct);
    } catch (error) {
      this.logger.error('Error al crear el producto:', error.stack);
      // Aquí podrías tener lógica para borrar mockups de S3 si falló el guardado en BD
      throw new InternalServerErrorException('Error al crear el producto.');
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