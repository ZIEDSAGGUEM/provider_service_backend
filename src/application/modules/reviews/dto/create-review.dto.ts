import { IsNotEmpty, IsString, IsNumber, Min, Max, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  requestId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment: string;
}

