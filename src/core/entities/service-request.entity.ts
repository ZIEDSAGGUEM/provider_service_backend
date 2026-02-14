import { RequestStatus } from '@prisma/client';

export { RequestStatus };

export class ServiceRequestEntity {
  id: string;
  clientId: string;
  providerId: string;
  categoryId: string;
  
  // Request details
  title: string;
  description: string;
  location?: string | null;
  
  // Scheduling
  preferredDate: Date;
  preferredTime: string;
  scheduledDate?: Date | null;
  
  // Financials
  estimatedBudget?: number | null;
  finalPrice?: number | null;
  
  // Status tracking
  status: RequestStatus;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (populated by repository)
  client?: any;
  provider?: any;
  category?: any;

  constructor(data: Partial<ServiceRequestEntity>) {
    Object.assign(this, data);
  }
}

