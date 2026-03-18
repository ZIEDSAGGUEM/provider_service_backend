import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  messageNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  bookingNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  reviewNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  profileVisibility?: boolean;

  @IsOptional()
  @IsBoolean()
  showRatings?: boolean;

  @IsOptional()
  @IsBoolean()
  showAvailability?: boolean;
}
