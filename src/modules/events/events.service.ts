import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service'; // Prisma 경로에 맞게 수정

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    // DB의 like_count 증가 로직 [cite: 21, 47]
    async incrementLike(photoId: string) {
    return this.prisma.photo.update({
      where: { id: photoId },
      data: {
        like_count: {
          increment: 1, // 원자적 업데이트
        },
      },
    });
    }

    // 정렬 알고리즘 실행 및 1위 사진 조회 [cite: 19, 22]
    async getTopRankedPhoto(weddingId: string) {
        const topPhoto = await this.prisma.photo.findFirst({
            where: {
                wedding_id: weddingId,
                is_hidden: false // 블라인드 처리된 사진 제외 [cite: 21, 48]
            },
            orderBy: {
                like_count: 'desc', // 좋아요 순 정렬
            },
            select: { id: true },
        });

        return topPhoto ? topPhoto.id : null;
    }
}