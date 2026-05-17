import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid'; // 파일명 중복 방지용 (npm install uuid && npm install -D @types/uuid 필요할 수 있음)
import * as path from 'path';
import 'multer';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName = process.env.AWS_S3_BUCKET_NAME || 'momentin-bucket'; // 환경변수에서 가져오기

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'ap-northeast-2', // 예: 서울 리전
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const ext = path.extname(file.originalname);
        const fileName = `${uuidv4()}${ext}`; // 고유한 파일명 생성

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3Client.send(command);

            // 업로드된 파일의 퍼블릭 URL 반환 (버킷 정책에 따라 다를 수 있음)
            return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new InternalServerErrorException('이미지 업로드에 실패했습니다.');
        }
    }
}