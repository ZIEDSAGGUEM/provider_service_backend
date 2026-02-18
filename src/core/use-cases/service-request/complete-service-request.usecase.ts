import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { RequestStatus } from '@prisma/client';

export interface CompleteServiceRequestDto {
  completionNotes?: string;
  finalPrice?: number;
}

@Injectable()
export class CompleteServiceRequestUseCase {
  constructor(
    @Inject('IServiceRequestRepository')
    private readonly requestRepository: IServiceRequestRepository,
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(requestId: string, userId: string, data: CompleteServiceRequestDto) {
    // Verify provider exists
    const provider = await this.providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ForbiddenException('Only providers can complete service requests');
    }

    // Get the request
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Verify this request belongs to the provider
    if (request.providerId !== provider.id) {
      throw new ForbiddenException('You can only complete your own service requests');
    }

    // Verify status is IN_PROGRESS
    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot complete request with status ${request.status}. Request must be IN_PROGRESS first.`
      );
    }

    // Update status to COMPLETED, set completedAt, and optional notes
    const updatedRequest = await this.requestRepository.update(requestId, {
      status: RequestStatus.COMPLETED,
      completedAt: new Date(),
      completionNotes: data.completionNotes || null,
      finalPrice: data.finalPrice !== undefined ? data.finalPrice : (request.finalPrice ?? undefined),
    });

    // Increment provider's completed jobs count
    await this.providerRepository.incrementCompletedJobs(provider.id);

    return updatedRequest;
  }
}

