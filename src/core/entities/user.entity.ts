export enum UserRole {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

export class UserEntity {
  id: string;
  email: string;
  password?: string; // Optional for response (never send to frontend)
  name: string;
  avatar?: string | null;
  phone?: string | null;
  location?: string | null;
  role: UserRole;
  verified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  passwordResetToken?: string | null;
  passwordResetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}


