import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';

@Injectable()
export class GuestbooksService {
  private readonly demoUserId = '00000000-0000-0000-0000-000000000001';

  constructor(private readonly prisma: PrismaService) {}

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

  async createGuestbook(data: CreateGuestbookDto) {
    const user = await this.ensureUser(data.userId);

    return this.prisma.guestbook.create({
      data: {
        wedding_id: data.weddingId,
        user_id: user.id,
        message: data.message,
      },
      include: {
        user: {
          select: { display_name: true },
        },
      },
    });
  }

  async getGuestbooks(weddingId: string) {
    return this.prisma.guestbook.findMany({
      where: {
        wedding_id: weddingId,
        is_hidden: false,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        user: {
          select: { display_name: true },
        },
      },
    });
  }
}
