import { Injectable, Inject } from '@nestjs/common';
import type {
  IBookingRepository,
  BookingFilters,
} from '../../repositories/booking.repository.interface';
import { BookingEntity } from '../../entities/booking.entity';

/**
 * Lists all bookings for the authenticated client.
 * Supports filtering by status and date range.
 */
@Injectable()
export class GetClientBookingsUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
  ) {}

  async execute(
    clientId: string,
    filters?: BookingFilters,
  ): Promise<BookingEntity[]> {
    return this.bookingRepo.findByClient(clientId, filters);
  }
}
