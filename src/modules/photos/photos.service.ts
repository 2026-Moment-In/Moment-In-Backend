import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { S3Service } from '../../shared/s3/s3.service'; // 경로 주의
import { EventsGateway } from '../events/events.gateway'; // 라이브 스크린 송출용

@Injectable()
export class PhotosService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly s3Service: S3Service,
        private readonly eventsGateway: EventsGateway, // 이벤트를 발생시키기 위해 주입
    ) { }

    async getPhotos(weddingId: string) {
        return this.prisma.photo.findMany({
            where: {
                wedding_id: weddingId,
                is_hidden: false,
            },
            orderBy: {
                created_at: 'desc',
            },
            include: {
                user: { select: { display_name: true } },
            },
        });
    }

    async uploadAndSavePhoto(file: Express.Multer.File, data: CreatePhotoDto) {
        // 1. S3에 이미지 업로드 후 URL 받기
        const imageUrl = await this.s3Service.uploadFile(file);

        // 2. DB에 사진 데이터 인서트
        const savedPhoto = await this.prisma.photo.create({
            data: {
                wedding_id: data.weddingId,
                user_id: data.userId,
                image_url: imageUrl,
            },
            include: {
                user: { select: { display_name: true } }, // 닉네임 함께 가져오기
            }
        });

        // 3. 웹소켓을 통해 해당 예식장(Room)에 새 사진 실시간 송출
        this.eventsGateway.broadcastNewPhoto(data.weddingId, savedPhoto);

        return savedPhoto;
    }
}
