import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class WeddingsService {
  private readonly demoUserId = '00000000-0000-0000-0000-000000000001';

  constructor(private readonly prisma: PrismaService) {}

  private async ensureDemoUser() {
    return this.prisma.user.upsert({
      where: {
        provider_social_id: {
          provider: 'local',
          social_id: this.demoUserId,
        },
      },
      create: {
        id: this.demoUserId,
        provider: 'local',
        social_id: this.demoUserId,
        display_name: 'Guest',
      },
      update: {},
    });
  }

  private parseDate(value?: unknown) {
    if (typeof value !== 'string' || !value) {
      return undefined;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  private parseInvitation(wedding: { invitation_json?: string | null }) {
    if (!wedding.invitation_json) {
      return null;
    }

    try {
      return JSON.parse(wedding.invitation_json);
    } catch {
      return null;
    }
  }

  async createWeddingFromInvitation(data: any) {
    const admin = await this.ensureDemoUser();
    const code = randomUUID().slice(0, 8);

    const wedding = await this.prisma.wedding.create({
      data: {
        admin_id: admin.id,
        theme_code: code,
        invitation_json: JSON.stringify(data ?? {}),
        wedding_date: this.parseDate(data?.weddingDate),
        wedding_time: typeof data?.weddingTime === 'string' ? data.weddingTime : undefined,
        location_name: typeof data?.venueName === 'string' ? data.venueName : undefined,
        location_address: typeof data?.venueAddress === 'string' ? data.venueAddress : undefined,
      },
      include: {
        admin: { select: { display_name: true } },
      },
    });

    return { code, wedding };
  }

  async getWeddingById(id: string) {
    return this.prisma.wedding.findUnique({
      where: { id },
      include: {
        admin: { select: { display_name: true } },
      },
    });
  }

  async getWeddingByCode(code: string) {
    const wedding = await this.prisma.wedding.findUnique({
      where: { theme_code: code },
      include: {
        admin: { select: { display_name: true } },
      },
    });

    if (wedding) {
      return wedding;
    }

    return this.getWeddingById(code);
  }

  async getInvitationByCode(code: string) {
    const wedding = await this.getWeddingByCode(code);

    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    return {
      code: wedding.theme_code ?? wedding.id,
      wedding,
      data: this.parseInvitation(wedding),
    };
  }
}
