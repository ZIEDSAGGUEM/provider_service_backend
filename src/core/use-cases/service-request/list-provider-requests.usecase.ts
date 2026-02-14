import { Injectable, Inject } from '@nestjs/common';
import type { IServiceRequestRepository, ServiceRequestFilters } from '../../repositories/service-request.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { ServiceRequestEntity } from '../../entities/service-request.entity';

@Injectable()
export class ListProviderRequestsUseCase {
  constructor(
    @Inject('IServiceRequestRepository') private readonly requestRepository: IServiceRequestRepository,
    @Inject('IProviderRepository') private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(userId: string, filters?: ServiceRequestFilters): Promise<ServiceRequestEntity[]> {
    // Get the provider profile for this user
    const provider = await this.providerRepository.findByUserId(userId);
    
    if (!provider) {
      return []; // User is not a provider, return empty array
    }

    // Get all requests for this provider
    return this.requestRepository.findByProvider(provider.id, filters);
  }
}

