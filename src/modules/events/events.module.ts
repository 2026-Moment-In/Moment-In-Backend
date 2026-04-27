import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
// PrismaModule import 필요

@Module({
    // imports: [PrismaModule], // 데이터베이스 모듈 임포트
    providers: [EventsGateway, EventsService],
    exports: [EventsGateway], // PhotosModule 등에서 새 사진 업로드 시 broadcast하기 위해 내보냄
})
export class EventsModule { }