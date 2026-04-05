import { BookingStatus } from '@prisma/client';

export { BookingStatus };

/**
 * Core booking entity representing a scheduled time slot
 * between a client and a provider.
 */
export class BookingEntity {
  id: string;
  clientId: string;
  providerId: string;
  serviceRequestId?: string | null;

  // Scheduling
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;

  // Status
  status: BookingStatus;
  cancelledBy?: string | null;
  cancelReason?: string | null;

  // Notes
  notes?: string | null;
  providerNotes?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations (populated when included in queries)
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
  serviceRequest?: {
    id: string;
    title: string;
    status: string;
  } | null;

  constructor(data: Partial<BookingEntity>) {
    Object.assign(this, data);
  }
}

/**
 * Represents a date blocked by a provider (e.g., holidays, personal days).
 */
export class BlockedDateEntity {
  id: string;
  providerId: string;
  date: Date;
  reason?: string | null;
  createdAt: Date;

  constructor(data: Partial<BlockedDateEntity>) {
    Object.assign(this, data);
  }
}
