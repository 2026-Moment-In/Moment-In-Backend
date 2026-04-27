import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePhotoDto {
    @IsUUID()
    @IsNotEmpty()
    weddingId: string;

    @IsUUID()
    @IsNotEmpty()
    userId: string;
}