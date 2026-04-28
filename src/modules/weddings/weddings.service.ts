import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class WeddingsService {
  constructor(private readonly prisma: PrismaService) {}

  // 웨딩 페이지 입장용 데이터 조회
  async getWeddingById(id: string) {
    return this.prisma.wedding.findUnique({
      where: { id },
      include: {
        admin: { select: { display_name: true } },
      },
    });
  }

  // QR 코드나 코드로 입장 (기획서에 코드 입력 있음)
  async getWeddingByCode(code: string) {
    // 코드가 id라고 가정, 또는 별도 필드 추가 필요
    return this.getWeddingById(code);
  }
}