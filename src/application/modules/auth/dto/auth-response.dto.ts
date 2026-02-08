import { UserEntity } from '../../../../core/entities/user.entity';

export class AuthResponseDto {
  user: UserEntity;
  accessToken: string;
}
