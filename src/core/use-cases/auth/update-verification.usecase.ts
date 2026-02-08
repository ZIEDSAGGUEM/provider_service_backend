import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class UpdateVerificationUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, verified: boolean): Promise<UserEntity> {
    return await this.userRepository.update(userId, { verified });
  }
}

