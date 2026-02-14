import { Injectable, Inject } from '@nestjs/common';
import type { IServiceRequestRepository, ServiceRequestFilters } from '../../repositories/service-request.repository.interface';
import { ServiceRequestEntity } from '../../entities/service-request.entity';

@Injectable()
export class ListClientRequestsUseCase {
  constructor(
    @Inject('IServiceRequestRepository') private readonly requestRepository: IServiceRequestRepository,
  ) {}

  async execute(clientId: string, filters?: ServiceRequestFilters): Promise<ServiceRequestEntity[]> {
    return this.requestRepository.findByClient(clientId, filters);
  }
}

