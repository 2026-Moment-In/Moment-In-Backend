import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import * as path from 'path';
import 'multer';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME || 'momentin-bucket';

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  private hasAwsCredentials() {
    return Boolean(
      process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET_NAME,
    );
  }

  private async saveLocalFile(file: Express.Multer.File, fileName: string) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), file.buffer);

    return `http://localhost:${process.env.PORT ?? 3000}/uploads/${fileName}`;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;

    if (!this.hasAwsCredentials()) {
      return this.saveLocalFile(file, fileName);
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('Image upload failed.');
    }
  }
}
