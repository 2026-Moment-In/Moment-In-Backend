import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { WeddingsService } from './weddings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaveInvitationDto } from './dto/save-invitation.dto';

@Controller('weddings')
export class WeddingsController {
  constructor(private readonly weddingsService: WeddingsService) {}

  @Post('my')
  @UseGuards(JwtAuthGuard)
  async createMyWedding(@Req() req, @Body() data: SaveInvitationDto) {
    return this.weddingsService.createWeddingForAdmin(req.user.id, data);
  }

  @Get('my/list')
  @UseGuards(JwtAuthGuard)
  async getMyWeddings(@Req() req) {
    return this.weddingsService.getMyWeddings(req.user.id);
  }

  @Get('my/:id')
  @UseGuards(JwtAuthGuard)
  async getMyWedding(@Req() req, @Param('id') id: string) {
    return this.weddingsService.getMyWeddingById(req.user.id, id);
  }

  @Patch('my/:id')
  @UseGuards(JwtAuthGuard)
  async updateMyWedding(@Req() req, @Param('id') id: string, @Body() data: SaveInvitationDto) {
    return this.weddingsService.updateMyWedding(req.user.id, id, data);
  }

  @Delete('my/:id')
  @UseGuards(JwtAuthGuard)
  async deleteMyWedding(@Req() req, @Param('id') id: string) {
    return this.weddingsService.deleteMyWedding(req.user.id, id);
  }

  @Get('code/:code')
  async getWeddingByCode(@Param('code') code: string) {
    return this.weddingsService.getWeddingByCode(code);
  }

  @Get(':id')
  async getWedding(@Param('id') id: string) {
    return this.weddingsService.getWeddingById(id);
  }
}
