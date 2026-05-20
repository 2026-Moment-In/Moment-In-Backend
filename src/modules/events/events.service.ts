import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async incrementLike(photoId: string) {
    return this.prisma.photo.update({
      where: { id: photoId },
      data: {
        like_count: {
          increment: 1,
        },
      },
      include: {
        user: { select: { display_name: true } },
      },
    });
  }

  async getTopRankedPhoto(weddingId: string) {
    const topPhoto = await this.prisma.photo.findFirst({
      where: {
        wedding_id: weddingId,
        is_hidden: false,
      },
      orderBy: {
        like_count: 'desc',
      },
      select: { id: true },
    });

    return topPhoto ? topPhoto.id : null;
  }

  async getRanking(weddingId: string, take = 10) {
    return this.prisma.photo.findMany({
      where: {
        wedding_id: weddingId,
        is_hidden: false,
      },
      orderBy: { like_count: 'desc' },
      take,
      include: {
        user: { select: { display_name: true } },
      },
    });
  }
}
