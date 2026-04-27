import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { S3Service } from '../../shared/s3/s3.service';
import { EventsModule } from '../events/events.module'; // EventsGateway를 쓰기 위해 임포트

@Module({
    imports: [EventsModule], // 웹소켓 게이트웨이가 포함된 모듈
    controllers: [PhotosController],
    providers: [PhotosService, S3Service],
})
export class PhotosModule { }