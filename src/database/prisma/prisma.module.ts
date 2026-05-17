// src/database/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 전역 모듈로 설정하면 다른 모듈의 imports 배열에 매번 넣지 않아도 됩니다!
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }