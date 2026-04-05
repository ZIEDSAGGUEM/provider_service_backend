import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { IBookingRepository } from '../../repositories/booking.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { BookingEntity, BookingStatus } from '../../entities/booking.entity';

export interface RescheduleBookingInput {
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason?: string;
}

/**
 * Allows either the client or the provider to reschedule a booking
 * to a new date/time. The booking moves to RESCHEDULED status
 * and requires re-confirmation by the provider.
 */
@Injectable()
export class RescheduleBookingUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
  ) {}

  async execute(
    bookingId: string,
    userId: string,
    data: RescheduleBookingInput,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify the user is a participant (client or provider)
    const provider = await this.providerRepo.findByUserId(userId);
    const isClient = booking.clientId === userId;
    const isProvider = provider && provider.id === booking.providerId;
    if (!isClient && !isProvider) {
      throw new ForbiddenException('Only participants can reschedule this booking');
    }

    // Cannot reschedule completed, cancelled, or in-progress bookings
    const reschedulableStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.RESCHEDULED,
    ];
    if (!reschedulableStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Cannot reschedule a booking with status: ${booking.status}`,
      );
    }

    // Validate new date is in the future
    const newDate = new Date(data.date);
    newDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) {
      throw new BadRequestException('New booking date must be today or in the future');
    }

    // Check the date is not blocked
    const isBlocked = await this.bookingRepo.isDateBlocked(booking.providerId, newDate);
    if (isBlocked) {
      throw new BadRequestException('Provider is not available on the new date');
    }

    // Validate time and calculate duration
    const durationMinutes = this.calculateDuration(data.startTime, data.endTime);
    if (durationMinutes <= 0) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check new slot availability (exclude the current booking from conflict check)
    const isAvailable = await this.bookingRepo.isSlotAvailable(
      booking.providerId,
      newDate,
      data.startTime,
    );

    // If the slot is taken, it might be this same booking — allow if same provider+date+time
    const isSameSlot =
      booking.date.getTime() === newDate.getTime() &&
      booking.startTime === data.startTime;
    if (!isAvailable && !isSameSlot) {
      throw new BadRequestException('The new time slot is not available');
    }

    return this.bookingRepo.update(bookingId, {
      date: newDate,
      startTime: data.startTime,
      endTime: data.endTime,
      durationMinutes,
      status: BookingStatus.RESCHEDULED,
    });
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  }
}
