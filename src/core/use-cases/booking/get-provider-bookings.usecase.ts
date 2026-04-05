import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import type {
  IBookingRepository,
  BookingFilters,
} from '../../repositories/booking.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { BookingEntity } from '../../entities/booking.entity';

/**
 * Lists all bookings for the authenticated provider.
 * Supports filtering by status and date range.
 */
@Injectable()
export class GetProviderBookingsUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
  ) {}

  async execute(
    userId: string,
    filters?: BookingFilters,
  ): Promise<BookingEntity[]> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) {
      throw new ForbiddenException('Provider profile not found');
    }

    return this.bookingRepo.findByProvider(provider.id, filters);
  }
}
