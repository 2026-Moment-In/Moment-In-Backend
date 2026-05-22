import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SaveInvitationDto } from './dto/save-invitation.dto';

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

  private getString(...values: unknown[]) {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
    return undefined;
  }

  private toWeddingData(data: SaveInvitationDto | any) {
    const couple = data?.couple ?? {};

    return {
      invitation_json: JSON.stringify(data ?? {}),
      wedding_date: this.parseDate(this.getString(data?.weddingDate, couple?.weddingDate)),
      wedding_time: this.getString(data?.weddingTime, couple?.weddingTime),
      location_name: this.getString(data?.venueName, couple?.venue),
      location_address: this.getString(data?.venueAddress, couple?.venueAddress),
    };
  }

  async createWedding(data: any) {
    console.log('프론트에서 넘어온 데이터:', data);
    
    const admin = await this.ensureDemoUser();
    const code = "abc12345"; // 일단 테스트하려고 고정 코드

    // 일단 가짜 데이터 만들엇슴
    const wedding = await this.prisma.wedding.upsert({
      where: { id: "mock-wedding-id" },
      create: {
        id: "mock-wedding-id",
        admin_id: admin.id,
        theme_code: code,
        status: "active",
        ...this.toWeddingData(data),
      },
      update: {
        ...this.toWeddingData(data),
      },
      include: {
        admin: { select: { display_name: true } },
      },
    });

    return { code, wedding };
  }

  async createWeddingForAdmin(adminId: string, data: SaveInvitationDto) {
    const code = randomUUID().slice(0, 8);

    const wedding = await this.prisma.wedding.create({
      data: {
        admin_id: adminId,
        theme_code: code,
        ...this.toWeddingData(data),
      },
      include: {
        admin: { select: { display_name: true } },
      },
    });

    return { code, wedding };
  }

  async getMyWeddings(adminId: string) {
    return this.prisma.wedding.findMany({
      where: {
        admin_id: adminId,
        status: { not: 'deleted' },
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        admin: { select: { display_name: true } },
        _count: { select: { photos: true, guestbooks: true } },
      },
    });
  }

  async getMyWeddingById(adminId: string, id: string) {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id },
      include: {
        admin: { select: { display_name: true } },
        _count: { select: { photos: true, guestbooks: true } },
      },
    });

    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    if (wedding.admin_id !== adminId) {
      throw new ForbiddenException('You can only access your own wedding');
    }

    return {
      ...wedding,
      invitation: this.parseInvitation(wedding),
    };
  }

  async updateMyWedding(adminId: string, id: string, data: SaveInvitationDto) {
    await this.getMyWeddingById(adminId, id);

    return this.prisma.wedding.update({
      where: { id },
      data: this.toWeddingData(data),
      include: {
        admin: { select: { display_name: true } },
      },
    });
  }

  async deleteMyWedding(adminId: string, id: string) {
    await this.getMyWeddingById(adminId, id);

    return this.prisma.wedding.update({
      where: { id },
      data: { status: 'deleted' },
      include: {
        admin: { select: { display_name: true } },
      },
    });
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

  async incrementViewCountByCode(code: string) {
    const wedding = await this.getWeddingByCode(code);

    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    return this.prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        view_count: {
          increment: 1,
        },
      },
      include: {
        admin: { select: { display_name: true } },
      },
    });
  }

  // ⭕ [추가] qr.service.ts 에러 해결을 위한 가교 메서드 1
  async createWeddingFromInvitation(data: any) {
    return this.createWedding(data);
  }

  // ⭕ [추가] qr.service.ts 에러 해결을 위한 가교 메서드 2
  async getInvitationByCode(code: string) {
    let wedding = await this.getWeddingByCode(code);

    if (!wedding) {
      const normalizedCode = code.trim().toUpperCase();
      if (/^WEDDING[A-Z0-9]{4,12}$/.test(normalizedCode)) {
        wedding = await this.prisma.wedding.create({
          data: {
            admin_id: this.demoUserId,
            theme_code: normalizedCode,
            ...this.toWeddingData({
              greetingTitle: '소중한 분들을 초대합니다',
              greetingBody: '두 사람의 새로운 시작을 함께 축복해 주세요.',
              groomName: '신랑',
              brideName: '신부',
              weddingDate: '2026-06-20',
              weddingTime: '12:00',
              venueName: '예식장',
              venueAddress: '주소를 준비 중입니다',
            }),
          },
          include: {
            admin: { select: { display_name: true } },
          },
        });
      } else {
        throw new NotFoundException('Wedding not found');
      }
    }

    return {
      code: wedding.theme_code ?? wedding.id,
      wedding,
      data: this.parseInvitation(wedding),
    };
  }
}