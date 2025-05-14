// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { DesignsModule } from './designs/designs.module';
import { FilesModule } from './common/files/files.module';

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
        const dbHost = configService.get<string>('DB_HOST');
        const dbType = configService.get<string>('DB_TYPE') as any; // 'postgres'
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbDatabase = configService.get<string>('DB_DATABASE');
        const dbSynchronize = configService.get<string>('DB_SYNCHRONIZE') === 'true';

        // ----- Manejo Correcto del Puerto -----
        const dbPortString = configService.get<string>('DB_PORT');
        let dbPort = 5432; // Valor por defecto

        if (dbPortString) {
          const parsedPort = parseInt(dbPortString, 10);
          if (!isNaN(parsedPort)) {
            dbPort = parsedPort;
          } else {
            console.warn(
              `Invalid DB_PORT value "${dbPortString}" in .env file. Using default port 5432.`,
            );
          }
        } else {
          console.warn(
            `DB_PORT is not defined in .env file. Using default port 5432.`,
          );
        }
        // ----- Fin Manejo Correcto del Puerto -----

        // Verificar que las variables esenciales estén definidas
        if (!dbHost || !dbType || !dbUsername || !dbPassword || !dbDatabase) {
          throw new Error('One or more database environment variables are not defined. Please check your .env file.');
        }

        return {
          type: dbType,
          host: dbHost,
          port: dbPort, // Usar el dbPort procesado y validado
          username: dbUsername,
          password: dbPassword,
          database: dbDatabase,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: dbSynchronize,
          autoLoadEntities: true,
        };
      },
    }),
    AuthModule,
    CategoriesModule, // Añade AuthModule a los imports de AppModule
    DesignsModule,
    FilesModule,// ... otros módulos que vayas creando
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}