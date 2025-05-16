// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <--- IMPORTANTE: Importar ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Crear la instancia de la app PRIMERO

  // logger: ['log', 'error', 'warn', 'debug', 'verbose'];

  // Ahora que 'app' existe, puedes obtener ConfigService de ella
  const configService = app.get(ConfigService); 

  app.enableCors({
    // Leer la URL del frontend del .env, con un valor por defecto
    origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Habilitar validación global usando class-validator y class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma el payload a una instancia del DTO
      transformOptions: {
        enableImplicitConversion: true, // Permite conversión implícita de tipos
      },
    }),
  );

  const port = configService.get<number>('PORT') || 3001; // Leer el puerto del .env
  await app.listen(port);
  console.log(`Backend application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  console.error('ERROR FATAL NO CAPTURADO AL INICIAR LA APLICACIÓN:', err);
  console.error('Stack del Error:', err.stack);
  process.exit(1);
});