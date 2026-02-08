import { UserEntity, UserRole } from '../entities/user.entity';

export interface CreateUserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
}

export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  verified?: boolean;
  role?: UserRole;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: CreateUserDto): Promise<UserEntity>;
  update(id: string, data: UpdateUserDto): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}

