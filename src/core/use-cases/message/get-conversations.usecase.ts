import { Injectable, Inject } from '@nestjs/common';
import type { IMessageRepository, ConversationSummary } from '../../repositories/message.repository.interface';

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @Inject('IMessageRepository') private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(userId: string): Promise<ConversationSummary[]> {
    return this.messageRepository.getConversations(userId);
  }
}

