import { Module } from '@nestjs/common';
import { NearbyFacilitiesController } from './nearby-facilities.controller';
import { NearbyFacilitiesService } from './nearby-facilities.service';

@Module({
  controllers: [NearbyFacilitiesController],
  providers: [NearbyFacilitiesService],
})
export class NearbyFacilitiesModule {}
