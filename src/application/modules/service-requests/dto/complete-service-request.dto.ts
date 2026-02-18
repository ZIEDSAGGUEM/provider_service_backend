import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CompleteServiceRequestDto {
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  finalPrice?: number;
}

