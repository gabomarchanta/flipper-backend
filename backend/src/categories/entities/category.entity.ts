// backend/src/categories/entities/category.entity.ts
// import { Product } from '../../products/entities/product.entity'; // Importaremos después cuando exista Product
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Opcional: Slug para URLs amigables
  @Column({ unique: true, length: 70, nullable: true })
  slug?: string;

  // Opcional: Relación con Productos (una categoría puede tener muchos productos)
  // Descomenta y ajusta cuando crees la entidad Product
  /*
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
  */

  // Podrías añadir un hook @BeforeInsert o @BeforeUpdate para generar el slug automáticamente
  // a partir del 'name' si decides implementarlo.
}