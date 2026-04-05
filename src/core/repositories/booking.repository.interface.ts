import {
  BookingEntity,
  BookingStatus,
  BlockedDateEntity,
} from '../entities/booking.entity';

// --- DTOs for repository operations ---

export interface CreateBookingDto {
  clientId: string;
  providerId: string;
  serviceRequestId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  notes?: string;
}

export interface UpdateBookingDto {
  date?: Date;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  status?: BookingStatus;
  cancelledBy?: string;
  cancelReason?: string;
  notes?: string;
  providerNotes?: string;
}

export interface BookingFilters {
  clientId?: string;
  providerId?: string;
  status?: BookingStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface CreateBlockedDateDto {
  providerId: string;
  date: Date;
  reason?: string;
}

// --- Repository interface ---

export interface IBookingRepository {
  // Booking CRUD
  create(data: CreateBookingDto): Promise<BookingEntity>;
  findById(id: string): Promise<BookingEntity | null>;
  findAll(filters?: BookingFilters): Promise<BookingEntity[]>;
  findByClient(clientId: string, filters?: BookingFilters): Promise<BookingEntity[]>;
  findByProvider(providerId: string, filters?: BookingFilters): Promise<BookingEntity[]>;
  update(id: string, data: UpdateBookingDto): Promise<BookingEntity>;
  delete(id: string): Promise<void>;

  // Availability checks
  findByProviderAndDate(providerId: string, date: Date): Promise<BookingEntity[]>;
  isSlotAvailable(providerId: string, date: Date, startTime: string): Promise<boolean>;

  // Blocked dates management
  createBlockedDate(data: CreateBlockedDateDto): Promise<BlockedDateEntity>;
  findBlockedDates(providerId: string, fromDate?: Date, toDate?: Date): Promise<BlockedDateEntity[]>;
  isDateBlocked(providerId: string, date: Date): Promise<boolean>;
  deleteBlockedDate(id: string): Promise<void>;
}
