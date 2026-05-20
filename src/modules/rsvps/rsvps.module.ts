import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { RsvpsController } from './rsvps.controller';
import { RsvpsService } from './rsvps.service';

@Module({
  imports: [PrismaModule],
  controllers: [RsvpsController],
  providers: [RsvpsService],
})
export class RsvpsModule {}
