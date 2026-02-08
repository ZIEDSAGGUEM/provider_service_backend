export enum UserRole {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

export class UserEntity {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
  location?: string | null;
  role: UserRole;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

