import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IMessageRepository } from '../../repositories/message.repository.interface';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { MessageEntity } from '../../entities/message.entity';

@Injectable()
export class GetConversationUseCase {
  constructor(
    @Inject('IMessageRepository') private readonly messageRepository: IMessageRepository,
    @Inject('IServiceRequestRepository') private readonly requestRepository: IServiceRequestRepository,
    @Inject('IProviderRepository') private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(requestId: string, userId: string): Promise<MessageEntity[]> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Find provider to get providerUserId
    const provider = await this.providerRepository.findById(request.providerId);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Verify participant
    const isClient = request.clientId === userId;
    const isProvider = provider.userId === userId;
    if (!isClient && !isProvider) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Mark messages as read for this user
    await this.messageRepository.markAsRead(requestId, userId);

    return this.messageRepository.getByRequestId(requestId);
  }
}

