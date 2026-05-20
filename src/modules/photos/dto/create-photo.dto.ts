import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePhotoDto {
    @IsUUID()
    @IsNotEmpty()
    weddingId: string;

    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsOptional()
    displayName?: string;
}
