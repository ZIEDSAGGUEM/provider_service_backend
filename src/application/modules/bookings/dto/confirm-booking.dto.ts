import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ConfirmBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Provider notes must not exceed 500 characters' })
  providerNotes?: string;
}
