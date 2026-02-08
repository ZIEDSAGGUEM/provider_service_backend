import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../../../core/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(UserRole)
  role: UserRole;
}



