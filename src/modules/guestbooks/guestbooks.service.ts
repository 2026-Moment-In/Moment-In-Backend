import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';

@Injectable()
export class GuestbooksService {
    constructor(private readonly prisma: PrismaService) { }

    // 1. 방명록 작성 (DB 인서트)
    async createGuestbook(data: CreateGuestbookDto) {
        return this.prisma.guestbook.create({
            data: {
                wedding_id: data.weddingId,
                user_id: data.userId,
                message: data.message,
            },
        });
    }

    // 2. 방명록 목록 조회 (최신순 정렬 및 블라인드 처리된 글 제외)
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
                    select: { display_name: true }, // 작성자 이름(닉네임) 포함해서 반환
                },
            },
        });
    }
}