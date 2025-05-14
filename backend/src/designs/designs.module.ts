// backend/src/designs/designs.module.ts
import { Module } from '@nestjs/common';
import { DesignsService } from './designs.service';
import { DesignsController } from './designs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Design } from './entities/design.entity';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../common/files/files.module'; // Importa FilesModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Design]),
    AuthModule,
    FilesModule, // Para poder inyectar FilesService en DesignService
  ],
  controllers: [DesignsController],
  providers: [DesignsService],
})
export class DesignsModule {}