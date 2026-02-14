import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository.interface';
import { ServiceRequestEntity, RequestStatus } from '../../entities/service-request.entity';

@Injectable()
export class CancelServiceRequestUseCase {
  constructor(
    @Inject('IServiceRequestRepository') private readonly requestRepository: IServiceRequestRepository,
  ) {}

  async execute(requestId: string, userId: string, reason?: string): Promise<ServiceRequestEntity> {
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Only client can cancel their own request
    if (request.clientId !== userId) {
      throw new ForbiddenException('Only the client can cancel this request');
    }

    // Can only cancel PENDING or ACCEPTED requests
    if (request.status === RequestStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed request');
    }

    if (request.status === RequestStatus.CANCELLED) {
      throw new BadRequestException('Request is already cancelled');
    }

    if (request.status === RequestStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot cancel a request that is in progress. Please contact the provider.');
    }

    // Update request to cancelled
    return this.requestRepository.update(requestId, {
      status: RequestStatus.CANCELLED,
      cancelledBy: 'CLIENT',
      cancelReason: reason,
    });
  }
}

