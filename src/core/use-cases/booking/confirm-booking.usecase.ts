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

/**
 * Allows a provider to confirm a pending or rescheduled booking.
 * Only the provider assigned to the booking can confirm it.
 */
@Injectable()
export class ConfirmBookingUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
  ) {}

  async execute(
    bookingId: string,
    userId: string,
    providerNotes?: string,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify the user is the provider for this booking
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider || provider.id !== booking.providerId) {
      throw new ForbiddenException('Only the assigned provider can confirm this booking');
    }

    // Only PENDING or RESCHEDULED bookings can be confirmed
    const confirmableStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.RESCHEDULED,
    ];
    if (!confirmableStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Cannot confirm a booking with status: ${booking.status}`,
      );
    }

    return this.bookingRepo.update(bookingId, {
      status: BookingStatus.CONFIRMED,
      providerNotes,
    });
  }
}
