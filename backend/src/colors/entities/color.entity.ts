// backend/src/colors/entities/color.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { ProductVariant } from '../../products/entities/product-variant.entity'; // Para la relación inversa

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string; // ej: "Rojo Pasión"

  @Column({ unique: true, length: 7 }) // #RRGGBB
  hex_code: string; // ej: "#FF0000"

  // Opcional: Relación inversa con ProductVariant
  // @OneToMany(() => ProductVariant, (variant) => variant.color)
  // productVariants: ProductVariant[];
}