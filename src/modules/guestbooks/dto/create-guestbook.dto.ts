import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGuestbookDto {
    @IsUUID()
    @IsNotEmpty()
    weddingId: string;

    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}