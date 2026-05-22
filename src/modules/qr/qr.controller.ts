import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post()
  create(@Body() data: unknown) {
    return this.qrService.create(data);
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.qrService.findOne(code);
  }
}
