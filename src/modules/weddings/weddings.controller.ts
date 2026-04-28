import { Controller, Get, Param } from '@nestjs/common';
import { WeddingsService } from './weddings.service';

@Controller('weddings')
export class WeddingsController {
  constructor(private readonly weddingsService: WeddingsService) {}

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