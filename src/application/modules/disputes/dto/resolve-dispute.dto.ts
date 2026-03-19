import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class ResolveDisputeDto {
  @IsString()
  @IsIn(['CLIENT_FAVORED', 'PROVIDER_FAVORED', 'COMPROMISE'])
  resolution: 'CLIENT_FAVORED' | 'PROVIDER_FAVORED' | 'COMPROMISE';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNote?: string;
}
