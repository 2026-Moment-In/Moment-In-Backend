import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Get,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import 'multer';
@Controller('photos')
export class PhotosController {
    constructor(private readonly photosService: PhotosService) { }

    @Get('admin/:weddingId')
    @UseGuards(JwtAuthGuard)
    async findAllForAdmin(@Req() req, @Param('weddingId') weddingId: string) {
        return this.photosService.getAdminPhotos(req.user.id, weddingId);
    }

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

    @Patch(':photoId/hide')
    @UseGuards(JwtAuthGuard)
    async hidePhoto(@Req() req, @Param('photoId') photoId: string) {
        return this.photosService.setPhotoHidden(req.user.id, photoId, true);
    }

    @Patch(':photoId/show')
    @UseGuards(JwtAuthGuard)
    async showPhoto(@Req() req, @Param('photoId') photoId: string) {
        return this.photosService.setPhotoHidden(req.user.id, photoId, false);
    }
}
