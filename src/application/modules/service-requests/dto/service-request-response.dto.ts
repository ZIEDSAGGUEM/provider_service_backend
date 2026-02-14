import { ServiceRequestEntity, RequestStatus } from '../../../../core/entities/service-request.entity';

export class ServiceRequestResponseDto {
  id: string;
  clientId: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  location?: string | null;
  preferredDate: Date;
  preferredTime: string;
  scheduledDate?: Date | null;
  estimatedBudget?: number | null;
  finalPrice?: number | null;
  status: RequestStatus;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: any;
  provider?: any;
  category?: any;

  constructor(entity: ServiceRequestEntity) {
    this.id = entity.id;
    this.clientId = entity.clientId;
    this.providerId = entity.providerId;
    this.categoryId = entity.categoryId;
    this.title = entity.title;
    this.description = entity.description;
    this.location = entity.location;
    this.preferredDate = entity.preferredDate;
    this.preferredTime = entity.preferredTime;
    this.scheduledDate = entity.scheduledDate;
    this.estimatedBudget = entity.estimatedBudget;
    this.finalPrice = entity.finalPrice;
    this.status = entity.status;
    this.cancelledBy = entity.cancelledBy;
    this.cancelReason = entity.cancelReason;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.client = entity.client;
    this.provider = entity.provider;
    this.category = entity.category;
  }
}

