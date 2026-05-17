import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
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

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;

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
      throw new InternalServerErrorException('이미지 업로드에 실패했습니다.');
    }
  }
}
