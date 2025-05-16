// backend/src/designs/designs.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus, ParseFilePipe, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Para manejar subida de archivos
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { diskStorage } from 'multer'; // Opcional: si quieres guardar temporalmente en disco
import { extname } from 'path';

// Configuración de Multer (opcional, puedes manejarlo en memoria como está ahora)
// const storage = diskStorage({
//   destination: './uploads_temp', // Carpeta temporal, asegúrate que exista o créala
//   filename: (req, file, cb) => {
//     const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
//     cb(null, `${randomName}${extname(file.originalname)}`);
//   },
// });

@Controller('designs')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Proteger todo el controlador
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Post()
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file' /*, { storage } Opciones de multer si usas diskStorage */)) // 'file' es el nombre del campo en el form-data
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createDesignDto: CreateDesignDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Puedes añadir validadores aquí si quieres, ej:
          // new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          // new FileTypeValidator({ fileType: 'image/png' }), // Solo PNG
        ],
        fileIsRequired: true, // Asegura que el archivo sea obligatorio
        exceptionFactory: (error) => { // Para personalizar el mensaje de error
          console.error('Error de ParseFilePipe:', error)
          return new BadRequestException(`Error con el archivo subido: ${error}`);
        }
      })
    )
    file: Express.Multer.File,
  ) {
    console.log('Backend createDesignDto (con ParseFilePipe):', createDesignDto);
    console.log('Backend file (con ParseFilePipe):', file); // Debería ser el objeto File si ParseFilePipe tiene éxito
    return this.designsService.create(createDesignDto, file);
  }

  @Get()
  @Roles(Role.Admin, Role.User) // Permitir a admins y usuarios logueados ver diseños
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.designsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.User)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.designsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  // Si permites actualizar imagen, necesitarías @UseInterceptors(FileInterceptor('file')) aquí también
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDesignDto: UpdateDesignDto,
    // @UploadedFile() file?: Express.Multer.File, // Si permites actualizar archivo
  ) {
    return this.designsService.update(id, updateDesignDto /*, file */);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.designsService.remove(id);
  }
}