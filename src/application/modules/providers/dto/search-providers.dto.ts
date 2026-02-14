import { IsOptional, IsString, IsNumber, IsArray, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilityStatus, ProviderStatus } from '../../../../core/entities/provider.entity';

export class SearchProvidersDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxHourlyRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  serviceRadius?: number;
}

