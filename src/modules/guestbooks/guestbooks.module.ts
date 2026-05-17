import { Module } from '@nestjs/common';
import { GuestbooksController } from './guestbooks.controller';
import { GuestbooksService } from './guestbooks.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [GuestbooksController],
    providers: [GuestbooksService],
})
export class GuestbooksModule { }