// backend/src/common/files/files.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid'; // Para generar nombres de archivo únicos

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    const regionFromConfig = this.configService.get<string>('AWS_REGION');
    const bucketNameFromConfig = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!regionFromConfig || !bucketNameFromConfig || !accessKeyId || !secretAccessKey) {
      const missingVars = [
        !regionFromConfig && 'AWS_REGION',
        !bucketNameFromConfig && 'AWS_S3_BUCKET_NAME',
        !accessKeyId && 'AWS_ACCESS_KEY_ID',
        !secretAccessKey && 'AWS_SECRET_ACCESS_KEY',
      ]
        .filter(Boolean)
        .join(', ');

      const errorMessage = `AWS S3 configuration is incomplete. Missing: ${missingVars}. Check .env variables.`;
      this.logger.error(errorMessage);
      throw new InternalServerErrorException(errorMessage);
    }

    // Asignar a las propiedades de la clase DESPUÉS de la verificación
    this.region = regionFromConfig;
    this.bucketName = bucketNameFromConfig;

    this.s3Client = new S3Client({
      region: this.region, // Ahora this.region es un string garantizado
      credentials: {
        accessKeyId: accessKeyId,       // accessKeyId es un string garantizado
        secretAccessKey: secretAccessKey, // secretAccessKey es un string garantizado
      },
    });
  }

  async uploadPublicFile(
    dataBuffer: Buffer,
    mimetype: string,
    originalName: string,
  ): Promise<{ url: string; key: string }> {
    const fileExtension = originalName.split('.').pop();
    const uniqueKey = `${uuidv4()}.${fileExtension}`; // Clave única para el archivo en S3

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueKey,
        Body: dataBuffer,
        ContentType: mimetype,
        ACL: 'public-read', // Hace el archivo públicamente legible (ajusta según tus necesidades de seguridad)
      });

      await this.s3Client.send(command);

      // Construye la URL pública del archivo
      // La URL puede variar según la región y si usas path-style o virtual-hosted-style
      // Esta es una forma común:
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${uniqueKey}`;
      // Alternativa si la anterior no funciona o si tu bucket está configurado diferente:
      // const url = `https://s3.${this.region}.amazonaws.com/${this.bucketName}/${uniqueKey}`;


      this.logger.log(`File uploaded successfully to S3. Key: ${uniqueKey}, URL: ${url}`);
      return { url, key: uniqueKey };
    } catch (error) {
      this.logger.error(`Failed to upload file to S3. Key: ${uniqueKey}`, error.stack);
      throw new InternalServerErrorException('Error al subir el archivo.');
    }
  }

  // Podrías añadir un método para eliminar archivos de S3 aquí también
  // async deletePublicFile(key: string): Promise<void> { ... }
}