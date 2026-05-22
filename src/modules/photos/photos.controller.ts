import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import 'multer';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

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
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPhotoDto: CreatePhotoDto,
  ) {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }
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