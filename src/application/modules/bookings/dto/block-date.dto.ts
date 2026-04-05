import { IsNotEmpty, IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class BlockDateDto {
  @IsNotEmpty()
  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date string' })
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Reason must not exceed 200 characters' })
  reason?: string;
}
