import { Injectable } from '@nestjs/common';
import { CreateServiceRequestUseCase } from '../../../core/use-cases/service-request/create-service-request.usecase';
import { GetServiceRequestUseCase } from '../../../core/use-cases/service-request/get-service-request.usecase';
import { ListClientRequestsUseCase } from '../../../core/use-cases/service-request/list-client-requests.usecase';
import { ListProviderRequestsUseCase } from '../../../core/use-cases/service-request/list-provider-requests.usecase';
import { CancelServiceRequestUseCase } from '../../../core/use-cases/service-request/cancel-service-request.usecase';
import { AcceptServiceRequestUseCase } from '../../../core/use-cases/service-request/accept-service-request.usecase';
import { DeclineServiceRequestUseCase } from '../../../core/use-cases/service-request/decline-service-request.usecase';
import { StartServiceRequestUseCase } from '../../../core/use-cases/service-request/start-service-request.usecase';
import { CompleteServiceRequestUseCase } from '../../../core/use-cases/service-request/complete-service-request.usecase';
import { ServiceRequestEntity, RequestStatus } from '../../../core/entities/service-request.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CompleteServiceRequestDto } from './dto/complete-service-request.dto';

@Injectable()
export class ServiceRequestsService {
  constructor(
    private readonly createServiceRequestUseCase: CreateServiceRequestUseCase,
    private readonly getServiceRequestUseCase: GetServiceRequestUseCase,
    private readonly listClientRequestsUseCase: ListClientRequestsUseCase,
    private readonly listProviderRequestsUseCase: ListProviderRequestsUseCase,
    private readonly cancelServiceRequestUseCase: CancelServiceRequestUseCase,
    private readonly acceptServiceRequestUseCase: AcceptServiceRequestUseCase,
    private readonly declineServiceRequestUseCase: DeclineServiceRequestUseCase,
    private readonly startServiceRequestUseCase: StartServiceRequestUseCase,
    private readonly completeServiceRequestUseCase: CompleteServiceRequestUseCase,
  ) {}

  async createRequest(userId: string, dto: CreateServiceRequestDto): Promise<ServiceRequestEntity> {
    return this.createServiceRequestUseCase.execute(userId, {
      providerId: dto.providerId,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      preferredDate: new Date(dto.preferredDate),
      preferredTime: dto.preferredTime,
      estimatedBudget: dto.estimatedBudget,
    });
  }

  async getRequestById(requestId: string, userId: string): Promise<ServiceRequestEntity> {
    return this.getServiceRequestUseCase.execute(requestId, userId);
  }

  async getMyRequests(userId: string, status?: RequestStatus): Promise<ServiceRequestEntity[]> {
    const filters = status ? { status } : undefined;
    return this.listClientRequestsUseCase.execute(userId, filters);
  }

  async getProviderRequests(userId: string, status?: RequestStatus): Promise<ServiceRequestEntity[]> {
    const filters = status ? { status } : undefined;
    return this.listProviderRequestsUseCase.execute(userId, filters);
  }

  async cancelRequest(requestId: string, userId: string, reason?: string): Promise<ServiceRequestEntity> {
    return this.cancelServiceRequestUseCase.execute(requestId, userId, reason);
  }

  async acceptRequest(requestId: string, userId: string): Promise<ServiceRequestEntity> {
    return this.acceptServiceRequestUseCase.execute(requestId, userId);
  }

  async declineRequest(requestId: string, userId: string, reason?: string): Promise<ServiceRequestEntity> {
    return this.declineServiceRequestUseCase.execute(requestId, userId, reason);
  }

  async startRequest(requestId: string, userId: string): Promise<ServiceRequestEntity> {
    return this.startServiceRequestUseCase.execute(requestId, userId);
  }

  async completeRequest(requestId: string, userId: string, dto: CompleteServiceRequestDto): Promise<ServiceRequestEntity> {
    return this.completeServiceRequestUseCase.execute(requestId, userId, {
      completionNotes: dto.completionNotes,
      finalPrice: dto.finalPrice,
    });
  }
}

