import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
    constructor(private readonly qrService: QrService) { }

    @Post()
    create(@Body() body: any) {
        return this.qrService.create(JSON.stringify(body));
    }

    @Get(':code')
    findOne(@Param('code') code: string) {
        return this.qrService.findOne(code);
    }

}
