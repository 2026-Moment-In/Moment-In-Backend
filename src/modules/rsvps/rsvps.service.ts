import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureWeddingOwner(adminId: string, weddingId: string) {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { admin_id: true },
    });

    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    if (wedding.admin_id !== adminId) {
      throw new ForbiddenException('You can only manage your own wedding RSVPs');
    }
  }

  async createRsvp(data: CreateRsvpDto) {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: data.weddingId },
      select: { id: true },
    });

    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    return this.prisma.rsvp.create({
      data: {
        wedding_id: data.weddingId,
        user_id: data.userId,
        name: data.name,
        attendance: data.attendance,
        guest_count: data.guestCount ?? (data.attendance === 'no' ? 0 : 1),
        meal_preference: data.mealPreference,
        message: data.message,
      },
    });
  }

  async getRsvps(weddingId: string) {
    return this.prisma.rsvp.findMany({
      where: { wedding_id: weddingId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getAdminRsvps(adminId: string, weddingId: string) {
    await this.ensureWeddingOwner(adminId, weddingId);
    return this.getRsvps(weddingId);
  }

  async deleteRsvp(adminId: string, rsvpId: string) {
    const rsvp = await this.prisma.rsvp.findUnique({
      where: { id: rsvpId },
      include: {
        wedding: { select: { admin_id: true } },
      },
    });

    if (!rsvp) {
      throw new NotFoundException('RSVP not found');
    }

    if (rsvp.wedding.admin_id !== adminId) {
      throw new ForbiddenException('You can only manage your own wedding RSVPs');
    }

    return this.prisma.rsvp.delete({
      where: { id: rsvpId },
    });
  }
}
