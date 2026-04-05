import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IBookingRepository } from '../../repositories/booking.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { BookingEntity } from '../../entities/booking.entity';

/**
 * Retrieves a single booking by ID.
 * Only the client or the assigned provider can view the booking.
 */
@Injectable()
export class GetBookingUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
  ) {}

  async execute(bookingId: string, userId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify the user is a participant
    const provider = await this.providerRepo.findByUserId(userId);
    const isClient = booking.clientId === userId;
    const isProvider = provider && provider.id === booking.providerId;

    if (!isClient && !isProvider) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }
}
