import { UserEntity, UserRole } from '../entities/user.entity';

export interface CreateUserDto {
  id?: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  verified?: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  verified?: boolean;
  role?: UserRole;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  passwordResetToken?: string | null;
  passwordResetTokenExpiry?: Date | null;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByVerificationToken(token: string): Promise<UserEntity | null>;
  findByPasswordResetToken(token: string): Promise<UserEntity | null>;
  create(data: CreateUserDto): Promise<UserEntity>;
  update(id: string, data: UpdateUserDto): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}





