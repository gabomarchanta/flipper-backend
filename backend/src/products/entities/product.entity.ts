// backend/src/products/entities/product.entity.ts
import { Category } from '../../categories/entities/category.entity';
import { Design } from '../../designs/entities/design.entity';
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_price: number; // Precio base sin considerar variantes

  // Relación con Category
  @ManyToOne(() => Category, /* (category) => category.products, */ { eager: true, onDelete: 'SET NULL', nullable: true }) // eager: true carga la categoría automáticamente
  @JoinColumn({ name: 'category_id' }) // Nombre de la columna FK
  category?: Category;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId?: string;

  // Relación con Design
  @ManyToOne(() => Design, /* (design) => design.products, */ { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'design_id' })
  design?: Design;

  @Column({ type: 'uuid', name: 'design_id', nullable: true })
  designId?: string;

  // Relación con ProductVariant
  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true, eager: true }) // cascade: true para guardar/actualizar variantes junto con el producto
  variants: ProductVariant[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ default: true })
  is_active: boolean;
}