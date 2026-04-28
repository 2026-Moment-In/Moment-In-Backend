import { Controller, Post, Param, Get } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('like/:photoId')
  async likePhoto(@Param('photoId') photoId: string) {
    return this.eventsService.incrementLike(photoId);
  }

  @Get('ranking/:weddingId')
  async getTopRankedPhoto(@Param('weddingId') weddingId: string) {
    return this.eventsService.getTopRankedPhoto(weddingId);
  }
}