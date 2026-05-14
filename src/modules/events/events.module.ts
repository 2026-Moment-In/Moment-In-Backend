import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from '../../database/prisma/prisma.service';

@Module({
    providers: [EventsGateway, EventsService, PrismaService],
    controllers: [EventsController],
    exports: [EventsGateway], // PhotosModule 등에서 새 사진 업로드 시 broadcast하기 위해 내보냄
})
export class EventsModule { }