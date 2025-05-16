// backend/src/products/entities/product-variant.entity.ts
import { Color } from '../../colors/entities/color.entity'; // <--- IMPORTAR Color
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  // Relación con Color
  @ManyToOne(() => Color, /* (color) => color.productVariants, */ { eager: true, onDelete: 'SET NULL', nullable: true }) // eager: true para cargar el color
  @JoinColumn({ name: 'color_id' })
  color?: Color; // Puede ser opcional si una variante no siempre tiene color específico

  @Column({ type: 'uuid', name: 'color_id', nullable: true })
  colorId?: string;

  // ELIMINA o comenta color_name SI USAS LA RELACIÓN:
  // @Column({ length: 50, comment: 'Nombre del color de la remera para esta variante' })
  // color_name: string; 

  @Column({ length: 10, comment: 'Ej: S, M, L, XL' })
  size: string;

  @Column({ type: 'int', default: 0 })
  stock_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Modificador de precio adicional' })
  additional_price: number;

  @Column({ type: 'text', nullable: true, comment: 'URL del mockup generado' })
  mockup_image_url?: string;

  @Column({ type: 'text', nullable: true, comment: 'S3 Key del mockup' })
  mockup_image_key?: string;
}