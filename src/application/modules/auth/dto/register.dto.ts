import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

enum AllowedRegistrationRole {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(AllowedRegistrationRole, { message: 'Role must be CLIENT or PROVIDER' })
  role: AllowedRegistrationRole;
}
