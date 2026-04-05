import { BookingEntity, BookingStatus } from '../../../../core/entities/booking.entity';

/**
 * Response DTO that maps the BookingEntity to a client-safe response format.
 * Strips internal fields and ensures consistent API output.
 */
export class BookingResponseDto {
  id: string;
  clientId: string;
  providerId: string;
  serviceRequestId?: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: BookingStatus;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  notes?: string | null;
  providerNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: BookingEntity['client'];
  provider?: BookingEntity['provider'];
  serviceRequest?: BookingEntity['serviceRequest'];

  constructor(entity: BookingEntity) {
    this.id = entity.id;
    this.clientId = entity.clientId;
    this.providerId = entity.providerId;
    this.serviceRequestId = entity.serviceRequestId;
    this.date = entity.date;
    this.startTime = entity.startTime;
    this.endTime = entity.endTime;
    this.durationMinutes = entity.durationMinutes;
    this.status = entity.status;
    this.cancelledBy = entity.cancelledBy;
    this.cancelReason = entity.cancelReason;
    this.notes = entity.notes;
    this.providerNotes = entity.providerNotes;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.client = entity.client;
    this.provider = entity.provider;
    this.serviceRequest = entity.serviceRequest;
  }
}
