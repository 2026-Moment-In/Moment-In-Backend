import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';

@Injectable()
export class GuestbooksService {
  private readonly demoUserId = '00000000-0000-0000-0000-000000000001';

  constructor(private readonly prisma: PrismaService) {}

  private async ensureUser(userId = this.demoUserId) {
    return this.prisma.user.upsert({
      where: { id: userId },
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
    return this.prisma.guestbook.create({
      data: {
        wedding_id: data.weddingId,
        user_id: data.userId,
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

  private async ensureWeddingOwner(adminId: string, weddingId: string) {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { admin_id: true },
    });

    if (!wedding) throw new NotFoundException('Wedding not found');
    if (wedding.admin_id !== adminId) throw new ForbiddenException('You can only manage your own wedding');
  }

  async getAdminGuestbooks(adminId: string, weddingId: string) {
    await this.ensureWeddingOwner(adminId, weddingId);

    return this.prisma.guestbook.findMany({
      where: { wedding_id: weddingId },
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { display_name: true } },
      },
    });
  }

  async setGuestbookHidden(adminId: string, guestbookId: string, isHidden: boolean) {
    const guestbook = await this.prisma.guestbook.findUnique({
      where: { id: guestbookId },
      include: {
        wedding: { select: { admin_id: true } },
      },
    });

    if (!guestbook) throw new NotFoundException('Guestbook not found');
    if (guestbook.wedding.admin_id !== adminId) throw new ForbiddenException('You can only manage your own guestbooks');

    return this.prisma.guestbook.update({
      where: { id: guestbookId },
      data: { is_hidden: isHidden },
      include: {
        user: { select: { display_name: true } },
      },
    });
  }
}