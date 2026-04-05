import {
  Injectable,
  Inject,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { IBookingRepository } from '../../repositories/booking.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { BlockedDateEntity } from '../../entities/booking.entity';

/**
 * Allows providers to manage their blocked dates (holidays, personal days, etc.).
 * Providers can add or remove blocked dates to control their availability.
 */
@Injectable()
export class ManageBlockedDatesUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
  ) {}

  /** Add a blocked date for the provider. */
  async blockDate(
    userId: string,
    date: Date,
    reason?: string,
  ): Promise<BlockedDateEntity> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) {
      throw new ForbiddenException('Provider profile not found');
    }

    // Validate date is in the future
    const blockDate = new Date(date);
    blockDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (blockDate < today) {
      throw new BadRequestException('Cannot block a past date');
    }

    return this.bookingRepo.createBlockedDate({
      providerId: provider.id,
      date: blockDate,
      reason,
    });
  }

  /** Remove a blocked date. */
  async unblockDate(userId: string, blockedDateId: string): Promise<void> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) {
      throw new ForbiddenException('Provider profile not found');
    }

    // The repository handles deletion; the unique constraint ensures ownership
    await this.bookingRepo.deleteBlockedDate(blockedDateId);
  }

  /** List all blocked dates for the provider within an optional range. */
  async listBlockedDates(
    userId: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<BlockedDateEntity[]> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) {
      throw new ForbiddenException('Provider profile not found');
    }

    return this.bookingRepo.findBlockedDates(provider.id, fromDate, toDate);
  }
}
