import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
    this.endpoint = this.configService.getOrThrow<string>('S3_ENDPOINT');

    this.s3Client = new S3Client({
      region: 'default',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(
    file: MulterFile,
    folder: string = '',
    customFilename?: string,
  ): Promise<string> {
    // Decode original name to handle non-ASCII characters properly if needed,
    // but usually safer to just generate a new name.
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    const extension = originalName.split('.').pop();
    const filename = customFilename || `${uuidv4()}.${extension}`;
    const key = folder ? `${folder}/${filename}` : filename;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );

      // Construct valid URL
      // Remove trailing slash from endpoint if present
      const baseUrl = this.endpoint.replace(/\/$/, '');
      const url = `${baseUrl}/${this.bucketName}/${key}`;

      return url;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Error uploading file to S3: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Error deleting file from S3: ${err.message}`,
        err.stack,
      );
    }
  }
}
