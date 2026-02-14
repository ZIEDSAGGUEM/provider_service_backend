import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelServiceRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Cancellation reason must not exceed 500 characters' })
  reason?: string;
}

