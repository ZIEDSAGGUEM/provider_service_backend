import { Injectable, Inject } from '@nestjs/common';
import type { IMessageRepository } from '../../repositories/message.repository.interface';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject('IMessageRepository') private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(userId: string): Promise<{ count: number }> {
    const count = await this.messageRepository.getUnreadCount(userId);
    return { count };
  }
}

