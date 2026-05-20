import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { GuestbooksModule } from './modules/guestbooks/guestbooks.module';
import { PhotosModule } from './modules/photos/photos.module';
import { WeddingsModule } from './modules/weddings/weddings.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { QrModule } from './modules/qr/qr.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    EventsModule,
    GuestbooksModule,
    PhotosModule,
    QrModule,
    WeddingsModule,
    QrModule,
  ],
})
export class AppModule {}
