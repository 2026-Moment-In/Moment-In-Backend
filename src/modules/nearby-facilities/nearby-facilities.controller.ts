import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RecommendNearbyFacilitiesDto } from './dto/recommend-nearby-facilities.dto';
import { NearbyFacilitiesService } from './nearby-facilities.service';

@Controller('nearby-facilities')
export class NearbyFacilitiesController {
  constructor(private readonly nearbyFacilitiesService: NearbyFacilitiesService) {}

  @Post('recommend')
  async recommend(@Body() data: RecommendNearbyFacilitiesDto) {
    return this.nearbyFacilitiesService.recommend(data);
  }

  @Get('recommend')
  async recommendByQuery(@Query() query: RecommendNearbyFacilitiesDto) {
    return this.nearbyFacilitiesService.recommend(query);
  }
}
