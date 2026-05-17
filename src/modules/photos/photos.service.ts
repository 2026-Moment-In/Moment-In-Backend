import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { S3Service } from '../../shared/s3/s3.service';
import { EventsGateway } from '../events/events.gateway';
import { CreatePhotoDto } from './dto/create-photo.dto';
import 'multer';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly eventsGateway: EventsGateway,
  ) {}

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
    const imageUrl = await this.s3Service.uploadFile(file);

    const savedPhoto = await this.prisma.photo.create({
      data: {
        wedding_id: data.weddingId,
        user_id: data.userId,
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
