import { Injectable, Optional } from '@nestjs/common';
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
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../../gateways/events.gateway';

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
    @Optional() private readonly notificationsService?: NotificationsService,
    @Optional() private readonly eventsGateway?: EventsGateway,
  ) {}

  async createRequest(userId: string, dto: CreateServiceRequestDto): Promise<ServiceRequestEntity> {
    const request = await this.createServiceRequestUseCase.execute(userId, {
      providerId: dto.providerId,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      preferredDate: new Date(dto.preferredDate),
      preferredTime: dto.preferredTime,
      estimatedBudget: dto.estimatedBudget,
    });

    // Notify provider of new request
    const providerUserId = request.provider?.userId;
    if (providerUserId) {
      this.notify(providerUserId, 'REQUEST_NEW', 'New Service Request', `You have a new request: ${request.title}`);
    }

    return request;
  }

  async getRequestById(requestId: string, userId: string): Promise<ServiceRequestEntity> {
    return this.getServiceRequestUseCase.execute(requestId, userId);
  }

  async getMyRequests(userId: string, status?: RequestStatus): Promise<ServiceRequestEntity[]> {
    return this.listClientRequestsUseCase.execute(userId, status ? { status } : undefined);
  }

  async getProviderRequests(userId: string, status?: RequestStatus): Promise<ServiceRequestEntity[]> {
    return this.listProviderRequestsUseCase.execute(userId, status ? { status } : undefined);
  }

  async cancelRequest(requestId: string, userId: string, reason?: string): Promise<ServiceRequestEntity> {
    const request = await this.cancelServiceRequestUseCase.execute(requestId, userId, reason);
    const targetUserId = request.provider?.userId;
    if (targetUserId) {
      this.notify(targetUserId, 'REQUEST_CANCELLED', 'Request Cancelled', `Request "${request.title}" was cancelled`);
    }
    return request;
  }

  async acceptRequest(requestId: string, userId: string): Promise<ServiceRequestEntity> {
    const request = await this.acceptServiceRequestUseCase.execute(requestId, userId);
    this.notify(request.clientId, 'REQUEST_ACCEPTED', 'Request Accepted', `Your request "${request.title}" has been accepted`);
    return request;
  }

  async declineRequest(requestId: string, userId: string, reason?: string): Promise<ServiceRequestEntity> {
    const request = await this.declineServiceRequestUseCase.execute(requestId, userId, reason);
    this.notify(request.clientId, 'REQUEST_DECLINED', 'Request Declined', `Your request "${request.title}" was declined`);
    return request;
  }

  async startRequest(requestId: string, userId: string): Promise<ServiceRequestEntity> {
    const request = await this.startServiceRequestUseCase.execute(requestId, userId);
    this.notify(request.clientId, 'REQUEST_STARTED', 'Job Started', `Work on "${request.title}" has started`);
    return request;
  }

  async completeRequest(requestId: string, userId: string, dto: CompleteServiceRequestDto): Promise<ServiceRequestEntity> {
    const request = await this.completeServiceRequestUseCase.execute(requestId, userId, {
      completionNotes: dto.completionNotes,
      finalPrice: dto.finalPrice,
    });
    this.notify(request.clientId, 'REQUEST_COMPLETED', 'Job Completed', `"${request.title}" has been completed`);
    return request;
  }

  private async notify(userId: string, type: any, title: string, body: string) {
    if (!this.notificationsService) return;
    try {
      const notification = await this.notificationsService.create({ userId, type, title, body });
      this.eventsGateway?.emitNotification(userId, notification);
    } catch {}
  }
}
