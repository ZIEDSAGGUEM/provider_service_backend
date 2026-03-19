import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class RemovePortfolioImageDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'imageUrl must be a valid URL' })
  imageUrl: string;
}
