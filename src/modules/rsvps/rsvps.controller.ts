import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { RsvpsService } from './rsvps.service';

@Controller('rsvps')
export class RsvpsController {
  constructor(private readonly rsvpsService: RsvpsService) {}

  @Post()
  async create(@Body() createRsvpDto: CreateRsvpDto) {
    return this.rsvpsService.createRsvp(createRsvpDto);
  }

  @Get('admin/:weddingId')
  @UseGuards(JwtAuthGuard)
  async findAllForAdmin(@Req() req, @Param('weddingId') weddingId: string) {
    return this.rsvpsService.getAdminRsvps(req.user.id, weddingId);
  }

  @Get(':weddingId')
  async findAll(@Param('weddingId') weddingId: string) {
    return this.rsvpsService.getRsvps(weddingId);
  }

  @Delete(':rsvpId')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req, @Param('rsvpId') rsvpId: string) {
    return this.rsvpsService.deleteRsvp(req.user.id, rsvpId);
  }
}
