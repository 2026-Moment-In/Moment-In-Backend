import { Module } from '@nestjs/common';
import { GuestbooksController } from './guestbooks.controller';
import { GuestbooksService } from './guestbooks.service';

@Module({
    controllers: [GuestbooksController],
    providers: [GuestbooksService],
})
export class GuestbooksModule { }