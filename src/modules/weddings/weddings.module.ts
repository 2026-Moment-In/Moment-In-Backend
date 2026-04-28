import { Module } from '@nestjs/common';
import { WeddingsService } from './weddings.service';
import { WeddingsController } from './weddings.controller';
import { PrismaService } from '../../database/prisma/prisma.service';

@Module({
  controllers: [WeddingsController],
  providers: [WeddingsService, PrismaService],
  exports: [WeddingsService],
})
export class WeddingsModule {}
