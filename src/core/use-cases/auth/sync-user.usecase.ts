import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { UserEntity, UserRole } from '../../entities/user.entity';

export interface SyncUserInput {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
}

@Injectable()
export class SyncUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: SyncUserInput): Promise<UserEntity> {
    // Check if user already exists
    const existingUser = await this.userRepository.findById(input.id);

    if (existingUser) {
      // Update existing user
      return await this.userRepository.update(input.id, {
        name: input.name,
        avatar: input.avatar,
        verified: input.verified,
        role: input.role,
      });
    }

    // Create new user
    return await this.userRepository.create({
      id: input.id,
      email: input.email,
      name: input.name,
      role: input.role,
      avatar: input.avatar,
      verified: input.verified,
    });
  }
}

