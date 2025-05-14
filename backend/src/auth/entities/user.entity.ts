// backend/src/auth/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users') // Nombre de la tabla en la base de datos
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string; // Almacenaremos el hash de la contraseña

  @Column({ default: 'admin' }) // Por ahora, todos serán admin
  role: string;

  // Hook para hashear la contraseña antes de guardar
  @BeforeInsert()
  async hashPassword() {
    if (this.password_hash) { // Solo hashea si se proporciona una nueva contraseña
      const saltRounds = 10;
      this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
    }
  }

  // Método para validar la contraseña (no se guarda en la BD)
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }
}