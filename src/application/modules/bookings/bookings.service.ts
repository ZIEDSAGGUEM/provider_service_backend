import { Injectable } from '@nestjs/common';
import { GetAvailableSlotsUseCase, AvailableSlot } from '../../../core/use-cases/booking/get-available-slots.usecase';
import { CreateBookingUseCase } from '../../../core/use-cases/booking/create-booking.usecase';
import { ConfirmBookingUseCase } from '../../../core/use-cases/booking/confirm-booking.usecase';
import { RescheduleBookingUseCase } from '../../../core/use-cases/booking/reschedule-booking.usecase';
import { CancelBookingUseCase } from '../../../core/use-cases/booking/cancel-booking.usecase';
import { GetBookingUseCase } from '../../../core/use-cases/booking/get-booking.usecase';
import { GetProviderBookingsUseCase } from '../../../core/use-cases/booking/get-provider-bookings.usecase';
import { GetClientBookingsUseCase } from '../../../core/use-cases/booking/get-client-bookings.usecase';
import { ManageBlockedDatesUseCase } from '../../../core/use-cases/booking/manage-blocked-dates.usecase';
import { BookingEntity, BlockedDateEntity, BookingStatus } from '../../../core/entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';

/**
 * Application service that orchestrates booking use cases.
 * Acts as a facade between the controller and the domain layer.
 */
@Injectable()
export class BookingsService {
  constructor(
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly confirmBookingUseCase: ConfirmBookingUseCase,
    private readonly rescheduleBookingUseCase: RescheduleBookingUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
    private readonly getBookingUseCase: GetBookingUseCase,
    private readonly getProviderBookingsUseCase: GetProviderBookingsUseCase,
    private readonly getClientBookingsUseCase: GetClientBookingsUseCase,
    private readonly manageBlockedDatesUseCase: ManageBlockedDatesUseCase,
  ) {}

  // ─── Availability ─────────────────────────────────────────────────────────────

  async getAvailableSlots(
    providerId: string,
    date: string,
    slotDuration?: number,
  ): Promise<AvailableSlot[]> {
    return this.getAvailableSlotsUseCase.execute(
      providerId,
      new Date(date),
      slotDuration,
    );
  }

  // ─── Booking CRUD ─────────────────────────────────────────────────────────────

  async createBooking(
    clientId: string,
    dto: CreateBookingDto,
  ): Promise<BookingEntity> {
    return this.createBookingUseCase.execute(clientId, {
      providerId: dto.providerId,
      serviceRequestId: dto.serviceRequestId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      notes: dto.notes,
    });
  }

  async getBooking(bookingId: string, userId: string): Promise<BookingEntity> {
    return this.getBookingUseCase.execute(bookingId, userId);
  }

  async confirmBooking(
    bookingId: string,
    userId: string,
    providerNotes?: string,
  ): Promise<BookingEntity> {
    return this.confirmBookingUseCase.execute(bookingId, userId, providerNotes);
  }

  async rescheduleBooking(
    bookingId: string,
    userId: string,
    dto: RescheduleBookingDto,
  ): Promise<BookingEntity> {
    return this.rescheduleBookingUseCase.execute(bookingId, userId, {
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
  ): Promise<BookingEntity> {
    return this.cancelBookingUseCase.execute(bookingId, userId, reason);
  }

  // ─── Listing ──────────────────────────────────────────────────────────────────

  async getClientBookings(
    clientId: string,
    status?: BookingStatus,
  ): Promise<BookingEntity[]> {
    return this.getClientBookingsUseCase.execute(
      clientId,
      status ? { status } : undefined,
    );
  }

  async getProviderBookings(
    userId: string,
    status?: BookingStatus,
  ): Promise<BookingEntity[]> {
    return this.getProviderBookingsUseCase.execute(
      userId,
      status ? { status } : undefined,
    );
  }

  // ─── Blocked Dates ────────────────────────────────────────────────────────────

  async blockDate(
    userId: string,
    date: string,
    reason?: string,
  ): Promise<BlockedDateEntity> {
    return this.manageBlockedDatesUseCase.blockDate(userId, new Date(date), reason);
  }

  async unblockDate(userId: string, blockedDateId: string): Promise<void> {
    return this.manageBlockedDatesUseCase.unblockDate(userId, blockedDateId);
  }

  async getBlockedDates(userId: string): Promise<BlockedDateEntity[]> {
    return this.manageBlockedDatesUseCase.listBlockedDates(userId);
  }
}
