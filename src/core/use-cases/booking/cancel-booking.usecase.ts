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
 * Allows either the client or the provider to cancel a booking.
 * Records who initiated the cancellation and the reason.
 * Completed and already-cancelled bookings cannot be cancelled.
 */
@Injectable()
export class CancelBookingUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
  ) {}

  async execute(
    bookingId: string,
    userId: string,
    reason?: string,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Determine if the user is client or provider
    const provider = await this.providerRepo.findByUserId(userId);
    const isClient = booking.clientId === userId;
    const isProvider = provider && provider.id === booking.providerId;

    if (!isClient && !isProvider) {
      throw new ForbiddenException('Only participants can cancel this booking');
    }

    // Cannot cancel completed or already cancelled bookings
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (booking.status === BookingStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Cannot cancel a booking that is in progress. Please contact support.',
      );
    }

    return this.bookingRepo.update(bookingId, {
      status: BookingStatus.CANCELLED,
      cancelledBy: isClient ? 'CLIENT' : 'PROVIDER',
      cancelReason: reason,
    });
  }
}
