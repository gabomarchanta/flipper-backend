import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // Habilitar validación global usando class-validator y class-transformer
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remueve propiedades que no están en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
    transform: true, // Transforma el payload a una instancia del DTO
    transformOptions: {
      enableImplicitConversion: true, // Permite conversión implícita de tipos (ej. string de query a number)
    },
  }));

  await app.listen(3001);
  console.log(`Backend application is running on: ${await app.getUrl()}`);
}
bootstrap();
