import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRsvpDto {
  @IsUUID()
  @IsNotEmpty()
  weddingId: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(['yes', 'no', 'undecided'])
  attendance: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  guestCount?: number;

  @IsString()
  @IsOptional()
  mealPreference?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
