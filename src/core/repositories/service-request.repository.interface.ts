import { ServiceRequestEntity, RequestStatus } from '../entities/service-request.entity';

export interface CreateServiceRequestDto {
  clientId: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  location?: string;
  preferredDate: Date;
  preferredTime: string;
  estimatedBudget?: number;
}

export interface UpdateServiceRequestDto {
  title?: string;
  description?: string;
  location?: string;
  preferredDate?: Date;
  preferredTime?: string;
  estimatedBudget?: number;
  scheduledDate?: Date;
  finalPrice?: number;
  status?: RequestStatus;
  cancelledBy?: string;
  cancelReason?: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  completionNotes?: string | null;
}

export interface ServiceRequestFilters {
  clientId?: string;
  providerId?: string;
  categoryId?: string;
  status?: RequestStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface IServiceRequestRepository {
  create(data: CreateServiceRequestDto): Promise<ServiceRequestEntity>;
  findById(id: string): Promise<ServiceRequestEntity | null>;
  findAll(filters?: ServiceRequestFilters): Promise<ServiceRequestEntity[]>;
  findByClient(clientId: string, filters?: ServiceRequestFilters): Promise<ServiceRequestEntity[]>;
  findByProvider(providerId: string, filters?: ServiceRequestFilters): Promise<ServiceRequestEntity[]>;
  update(id: string, data: UpdateServiceRequestDto): Promise<ServiceRequestEntity>;
  delete(id: string): Promise<void>;
}

