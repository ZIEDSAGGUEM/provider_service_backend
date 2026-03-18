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

  // Lifecycle timestamps
  startedAt?: Date | null;
  completedAt?: Date | null;
  completionNotes?: string | null;

  createdAt: Date;
  updatedAt: Date;

  client?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
    phone?: string | null;
    location?: string | null;
  } | null;
  provider?: {
    id: string;
    userId: string;
    categoryId: string;
    hourlyRate: number;
    rating: number;
    reviewCount: number;
    user?: {
      id: string;
      name: string;
      avatar?: string | null;
      phone?: string | null;
      location?: string | null;
    } | null;
    category?: {
      id: string;
      name: string;
      icon: string;
    } | null;
  } | null;
  category?: {
    id: string;
    name: string;
    icon: string;
    description?: string;
  } | null;

  constructor(data: Partial<ServiceRequestEntity>) {
    Object.assign(this, data);
  }
}
