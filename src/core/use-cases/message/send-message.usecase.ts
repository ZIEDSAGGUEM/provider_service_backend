import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IMessageRepository } from '../../repositories/message.repository.interface';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { MessageEntity } from '../../entities/message.entity';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject('IMessageRepository') private readonly messageRepository: IMessageRepository,
    @Inject('IServiceRequestRepository') private readonly requestRepository: IServiceRequestRepository,
    @Inject('IProviderRepository') private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(senderId: string, requestId: string, content: string): Promise<MessageEntity> {
    // Get the service request
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Find provider to get providerUserId
    const provider = await this.providerRepository.findById(request.providerId);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Verify the sender is either the client or the provider
    const isClient = request.clientId === senderId;
    const isProvider = provider.userId === senderId;

    if (!isClient && !isProvider) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return this.messageRepository.send({
      senderId,
      requestId,
      content: content.trim(),
    });
  }
}

