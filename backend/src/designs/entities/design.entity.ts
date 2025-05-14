// backend/src/designs/entities/design.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('designs')
export class Design {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', comment: 'URL of the design image in S3' })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true, comment: 'S3 Key for the image, useful for deletion' })
  imageKey?: string; // Para poder borrar el objeto de S3 si borras el diseño
}