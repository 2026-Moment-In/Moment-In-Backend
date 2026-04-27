import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { GuestbooksService } from './guestbooks.service';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';

@Controller('guestbooks')
export class GuestbooksController {
    constructor(private readonly guestbooksService: GuestbooksService) { }

    // POST /guestbooks
    @Post()
    async create(@Body() createGuestbookDto: CreateGuestbookDto) {
        return this.guestbooksService.createGuestbook(createGuestbookDto);
    }

    // GET /guestbooks/:weddingId
    @Get(':weddingId')
    async findAll(@Param('weddingId') weddingId: string) {
        return this.guestbooksService.getGuestbooks(weddingId);
    }
}