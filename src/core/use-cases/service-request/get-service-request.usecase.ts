import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository.interface';
import { ServiceRequestEntity } from '../../entities/service-request.entity';

@Injectable()
export class GetServiceRequestUseCase {
  constructor(
    @Inject('IServiceRequestRepository') private readonly requestRepository: IServiceRequestRepository,
  ) {}

  async execute(requestId: string, userId: string): Promise<ServiceRequestEntity> {
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Check if user is either the client or the provider
    if (request.clientId !== userId && request.provider?.userId !== userId) {
      throw new ForbiddenException('You do not have access to this service request');
    }

    return request;
  }
}

