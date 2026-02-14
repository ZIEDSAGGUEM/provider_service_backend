import { IsString, IsNumber, IsArray, IsOptional, IsEnum, IsObject, Min, MaxLength } from 'class-validator';
import { AvailabilityStatus } from '../../../../core/entities/provider.entity';
import type { AvailabilitySchedule } from '../../../../core/entities/provider.entity';

export class CreateProviderDto {
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @IsOptional()
  @IsObject()
  availabilitySchedule?: AvailabilitySchedule;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  serviceRadius?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolio?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}

