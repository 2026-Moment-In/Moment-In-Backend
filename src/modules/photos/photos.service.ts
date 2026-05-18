import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { S3Service } from '../../shared/s3/s3.service';
import { EventsGateway } from '../events/events.gateway';
import 'multer';

@Injectable()
export class PhotosService {
  private readonly demoUserId = '00000000-0000-0000-0000-000000000001';

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private async ensureUser(userId = this.demoUserId) {
    return this.prisma.user.upsert({
      where: {
        provider_social_id: {
          provider: 'local',
          social_id: userId,
        },
      },
      create: {
        id: userId,
        provider: 'local',
        social_id: userId,
        display_name: userId === this.demoUserId ? 'Guest' : `Guest ${userId.slice(0, 6)}`,
      },
      update: {},
    });
  }

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
    const user = await this.ensureUser(data.userId);
    const imageUrl = await this.s3Service.uploadFile(file);

    const savedPhoto = await this.prisma.photo.create({
      data: {
        wedding_id: data.weddingId,
        user_id: user.id,
        image_url: imageUrl,
      },
      include: {
        user: { select: { display_name: true } },
      },
    });

    this.eventsGateway.broadcastNewPhoto(data.weddingId, savedPhoto);

    return savedPhoto;
  }
}
