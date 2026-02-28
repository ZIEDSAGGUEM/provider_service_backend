import { Injectable } from '@nestjs/common';
import { SendMessageUseCase } from '../../../core/use-cases/message/send-message.usecase';
import { GetConversationUseCase } from '../../../core/use-cases/message/get-conversation.usecase';
import { GetConversationsUseCase } from '../../../core/use-cases/message/get-conversations.usecase';
import { GetUnreadCountUseCase } from '../../../core/use-cases/message/get-unread-count.usecase';
import { MessageEntity } from '../../../core/entities/message.entity';
import type { ConversationSummary } from '../../../core/repositories/message.repository.interface';

@Injectable()
export class MessagesService {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
  ) {}

  async sendMessage(
    senderId: string,
    requestId: string,
    content: string,
  ): Promise<MessageEntity> {
    return this.sendMessageUseCase.execute(senderId, requestId, content);
  }

  async getConversation(
    requestId: string,
    userId: string,
  ): Promise<MessageEntity[]> {
    return this.getConversationUseCase.execute(requestId, userId);
  }

  async getConversations(userId: string): Promise<ConversationSummary[]> {
    return this.getConversationsUseCase.execute(userId);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    return this.getUnreadCountUseCase.execute(userId);
  }
}

