import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { ServiceRequestEntity, RequestStatus } from '../../entities/service-request.entity';

@Injectable()
export class DeclineServiceRequestUseCase {
  constructor(
    @Inject('IServiceRequestRepository') private readonly requestRepository: IServiceRequestRepository,
    @Inject('IProviderRepository') private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(requestId: string, userId: string, reason?: string): Promise<ServiceRequestEntity> {
    // Get the service request
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Verify the user is a provider
    const provider = await this.providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ForbiddenException('Only providers can decline requests');
    }

    // Verify the request is for this provider
    if (request.providerId !== provider.id) {
      throw new ForbiddenException('You can only decline requests sent to you');
    }

    // Verify the request is in PENDING status
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Cannot decline request with status: ${request.status}`);
    }

    // Decline the request (set to CANCELLED status)
    return this.requestRepository.update(requestId, {
      status: RequestStatus.CANCELLED,
    });
  }
}

