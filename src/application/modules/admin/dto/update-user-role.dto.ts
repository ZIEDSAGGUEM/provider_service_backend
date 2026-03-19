import { IsIn, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['CLIENT', 'PROVIDER', 'ADMIN'], { message: 'Invalid role' })
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
}
