import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, MinLength, MaxLength, Min } from 'class-validator';

export class CreateServiceRequestDto {
  @IsNotEmpty()
  @IsString()
  providerId: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNotEmpty()
  @IsDateString()
  preferredDate: string;

  @IsNotEmpty()
  @IsString()
  preferredTime: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Budget must be a positive number' })
  estimatedBudget?: number;
}

