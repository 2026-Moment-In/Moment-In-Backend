import { Controller, Post, Body, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { GuestbooksService } from './guestbooks.service';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('guestbooks')
export class GuestbooksController {
    constructor(private readonly guestbooksService: GuestbooksService) { }

    // POST /guestbooks
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createGuestbookDto: CreateGuestbookDto, @Req() req) {
        createGuestbookDto.userId = req.user.id;
        return this.guestbooksService.createGuestbook(createGuestbookDto);
    }

    @Get('admin/:weddingId')
    @UseGuards(JwtAuthGuard)
    async findAllForAdmin(@Req() req, @Param('weddingId') weddingId: string) {
        return this.guestbooksService.getAdminGuestbooks(req.user.id, weddingId);
    }

    // GET /guestbooks/:weddingId
    @Get(':weddingId')
    async findAll(@Param('weddingId') weddingId: string) {
        return this.guestbooksService.getGuestbooks(weddingId);
    }

    @Patch(':guestbookId/hide')
    @UseGuards(JwtAuthGuard)
    async hideGuestbook(@Req() req, @Param('guestbookId') guestbookId: string) {
        return this.guestbooksService.setGuestbookHidden(req.user.id, guestbookId, true);
    }

    @Patch(':guestbookId/show')
    @UseGuards(JwtAuthGuard)
    async showGuestbook(@Req() req, @Param('guestbookId') guestbookId: string) {
        return this.guestbooksService.setGuestbookHidden(req.user.id, guestbookId, false);
    }
}
