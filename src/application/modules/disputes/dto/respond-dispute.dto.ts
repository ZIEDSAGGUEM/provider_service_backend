import { IsString, IsNotEmpty, IsOptional, IsArray, MaxLength } from 'class-validator';

export class RespondDisputeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  providerResponse: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  providerEvidence?: string[];
}
