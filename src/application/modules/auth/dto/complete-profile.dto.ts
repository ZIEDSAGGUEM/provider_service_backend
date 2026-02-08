import { IsEnum } from 'class-validator';
import { UserRole } from '../../../../core/entities/user.entity';

export class CompleteProfileDto {
  @IsEnum(UserRole)
  role: UserRole;
}





