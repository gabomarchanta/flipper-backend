// backend/src/colors/colors.module.ts
import { Module } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { ColorsController } from './colors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Color]), AuthModule],
  controllers: [ColorsController],
  providers: [ColorsService],
  exports: [ColorsService], // Exportar si es necesario
})
export class ColorsModule {}