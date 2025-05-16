// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Importa TODAS tus entidades explícitamente
import { User } from './auth/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Design } from './designs/entities/design.entity';
import { Product } from './products/entities/product.entity';
import { ProductVariant } from './products/entities/product-variant.entity';
import { Color } from './colors/entities/color.entity';
// Importa otras entidades aquí a medida que las crees

// Importa tus módulos de funcionalidad (descomenta los que necesites)
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { DesignsModule } from './designs/designs.module';
import { FilesModule } from './common/files/files.module';
import { ProductsModule } from './products/products.module';
import { ColorsModule } from './colors/colors.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE') as any;
        const dbHost = configService.get<string>('DB_HOST');
        const dbPortString = configService.get<string>('DB_PORT');
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbDatabase = configService.get<string>('DB_DATABASE');
        const dbSynchronize = configService.get<string>('DB_SYNCHRONIZE') === 'true';

        let dbPort = 5432;
        if (dbPortString) {
          const parsedPort = parseInt(dbPortString, 10);
          dbPort = isNaN(parsedPort) ? 5432 : parsedPort;
          if (isNaN(parsedPort)) console.warn(`Invalid DB_PORT: ${dbPortString}, using 5432`);
        } else {
          console.warn('DB_PORT not defined, using 5432');
        }

        if (!dbType || !dbHost || !dbUsername || !dbPassword || !dbDatabase) {
          const errMsg = 'Database configuration is incomplete in .env';
          console.error(`ERROR: ${errMsg}`);
          throw new Error(errMsg);
        }

        return {
          type: dbType,
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword, 
          database: dbDatabase,
          entities: [User, Category, Design, Product, ProductVariant, Color /* , ...otras entidades */], // <--- CARGA MANUAL
          synchronize: dbSynchronize,
          autoLoadEntities: false, // <--- PONER EN FALSE si cargas manualmente
          logging: ['error', 'warn'], 
        };
      },
    }),
    // Descomenta los módulos que estés listo para usar
    AuthModule,
    CategoriesModule,
    DesignsModule,
    FilesModule,
    ProductsModule,
    ColorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}