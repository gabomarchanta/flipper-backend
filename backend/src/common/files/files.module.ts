// backend/src/common/files/files.module.ts
import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { ConfigModule } from '@nestjs/config'; // FilesService depende de ConfigService

@Module({
  imports: [ConfigModule], // Importar ConfigModule
  providers: [FilesService],
  exports: [FilesService], // Exportar para que otros módulos puedan usarlo
})
export class FilesModule {}