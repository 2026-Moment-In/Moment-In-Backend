import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WeddingsService } from './weddings.service';

@Controller('weddings')
export class WeddingsController {
  constructor(private readonly weddingsService: WeddingsService) {}


  @Post('my')
  async createMyWedding(@Body() data: any) {
    return this.weddingsService.createWedding(data);
  }

  @Get(':id')
  async getWedding(@Param('id') id: string) {
    return this.weddingsService.getWeddingById(id);
  }

  // 코드로 입장
  @Get('code/:code')
  async getWeddingByCode(@Param('code') code: string) {
    return this.weddingsService.getWeddingByCode(code);
  }
}