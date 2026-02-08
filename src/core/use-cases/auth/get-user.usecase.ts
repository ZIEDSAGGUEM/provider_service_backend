import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

