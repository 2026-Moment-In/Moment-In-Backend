import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class WeddingsService {
  constructor(private readonly prisma: PrismaService) {}


  async createWedding(data: any) {
    console.log('프론트에서 넘어온 데이터:', data);
    
    // 당장은 프론트 연동 테스트가 해야하니깐 일단 데이터 넣어뒀음 (수정하기)
    return {
      code: "abc12345",
      wedding: {
        id: "mock-wedding-id",
        admin_id: "mock-user-id",
        theme_code: "abc12345",
        invitation_json: JSON.stringify(data),
        wedding_date: data.weddingDate || "2026-06-20",
        wedding_time: data.weddingTime || "12:00",
        location_name: data.venueName || "테스트 예식장",
        location_address: data.venueAddress || "테스트 주소",
        status: "active",
        created_at: new Date().toISOString()
      }
    };
  }
  
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