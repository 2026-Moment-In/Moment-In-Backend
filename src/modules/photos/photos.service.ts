import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  private async ensureUser(userId = this.demoUserId, displayName?: string) {
    const safeDisplayName = displayName?.trim();

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
        display_name:
          safeDisplayName || (userId === this.demoUserId ? 'Guest' : `Guest ${userId.slice(0, 6)}`),
      },
      update: safeDisplayName ? { display_name: safeDisplayName } : {},
    });
  }

  private async ensureWeddingOwner(adminId: string, weddingId: string) {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { admin_id: true },
    });

    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    if (wedding.admin_id !== adminId) {
      throw new ForbiddenException('You can only manage your own wedding');
    }
  }

  async getPhotos(weddingId: string, includeHidden = false) {
    return this.prisma.photo.findMany({
      where: {
        wedding_id: weddingId,
        ...(includeHidden ? {} : { is_hidden: false }),
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        user: { select: { display_name: true } },
      },
    });
  }

  async getAdminPhotos(adminId: string, weddingId: string) {
    await this.ensureWeddingOwner(adminId, weddingId);
    return this.getPhotos(weddingId, true);
  }

  async uploadAndSavePhoto(file: Express.Multer.File, data: CreatePhotoDto) {
    const user = await this.ensureUser(data.userId, data.displayName);
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

  async setPhotoHidden(adminId: string, photoId: string, isHidden: boolean) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        wedding: { select: { admin_id: true } },
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.wedding.admin_id !== adminId) {
      throw new ForbiddenException('You can only manage your own wedding photos');
    }

    const updatedPhoto = await this.prisma.photo.update({
      where: { id: photoId },
      data: { is_hidden: isHidden },
      include: {
        user: { select: { display_name: true } },
      },
    });

    if (isHidden) {
      this.eventsGateway.broadcastPhotoHidden(photo.wedding_id, photoId);
    } else {
      this.eventsGateway.broadcastNewPhoto(photo.wedding_id, updatedPhoto);
    }

    return updatedPhoto;
  }
}
