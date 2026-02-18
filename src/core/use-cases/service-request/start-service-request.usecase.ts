import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class StartServiceRequestUseCase {
  constructor(
    @Inject('IServiceRequestRepository')
    private readonly requestRepository: IServiceRequestRepository,
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(requestId: string, userId: string) {
    // Verify provider exists
    const provider = await this.providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ForbiddenException('Only providers can start service requests');
    }

    // Get the request
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Verify this request belongs to the provider
    if (request.providerId !== provider.id) {
      throw new ForbiddenException('You can only start your own service requests');
    }

    // Verify status is ACCEPTED
    if (request.status !== RequestStatus.ACCEPTED) {
      throw new BadRequestException(
        `Cannot start request with status ${request.status}. Request must be ACCEPTED first.`
      );
    }

    // Update status to IN_PROGRESS and set startedAt
    return this.requestRepository.update(requestId, {
      status: RequestStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
  }
}

