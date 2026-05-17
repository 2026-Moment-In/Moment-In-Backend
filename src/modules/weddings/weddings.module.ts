import { Module } from '@nestjs/common';
import { WeddingsService } from './weddings.service';
import { WeddingsController } from './weddings.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WeddingsController],
  providers: [WeddingsService],
  exports: [WeddingsService],
})
export class WeddingsModule {}