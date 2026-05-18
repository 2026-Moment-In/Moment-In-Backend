import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { S3Service } from '../../shared/s3/s3.service';
import { EventsModule } from '../events/events.module';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
    imports: [EventsModule, PrismaModule],
    controllers: [PhotosController],
    providers: [PhotosService, S3Service],
})
export class PhotosModule { }