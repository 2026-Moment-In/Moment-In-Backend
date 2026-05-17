import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Controller('photos')
export class PhotosController {
    constructor(private readonly photosService: PhotosService) { }

    @Get(':weddingId')
    async findAll(@Param('weddingId') weddingId: string) {
        return this.photosService.getPhotos(weddingId);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file')) // 프론트엔드에서 폼데이터 키를 'file'로 보내야 함
    async uploadPhoto(
        @UploadedFile() file: Express.Multer.File,
        @Body() createPhotoDto: CreatePhotoDto,
    ) {
        if (!file) {
            throw new BadRequestException('업로드된 파일이 없습니다.');
        }

        // 기획서  명시: jpeg/png/webp 등 이미지 형식 검증 로직 추가 가능
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            throw new BadRequestException('지원하지 않는 이미지 형식입니다.');
        }

        return this.photosService.uploadAndSavePhoto(file, createPhotoDto);
    }
}
