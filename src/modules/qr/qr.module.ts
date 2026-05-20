import { Module } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { WeddingsModule } from '../weddings/weddings.module';

@Module({
  imports: [WeddingsModule],
  controllers: [QrController],
  providers: [QrService],
})
export class QrModule {}
