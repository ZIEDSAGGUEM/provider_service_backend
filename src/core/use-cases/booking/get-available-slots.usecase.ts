import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IBookingRepository } from '../../repositories/booking.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { ProviderStatus, AvailabilitySchedule } from '../../entities/provider.entity';

/**
 * Represents a single available time slot for booking.
 */
export interface AvailableSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

/**
 * Computes available booking slots for a provider on a given date.
 *
 * Logic:
 * 1. Validates the provider exists and is active
 * 2. Checks if the date is blocked by the provider
 * 3. Reads the provider's weekly availability schedule for that day
 * 4. Generates time slots based on the schedule
 * 5. Filters out already-booked slots
 */
@Injectable()
export class GetAvailableSlotsUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
  ) {}

  async execute(
    providerId: string,
    date: Date,
    slotDurationMinutes = 60,
  ): Promise<AvailableSlot[]> {
    // Validate provider exists and is active
    const provider = await this.providerRepo.findById(providerId);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    if (provider.status !== ProviderStatus.ACTIVE) {
      throw new BadRequestException('Provider is not currently accepting bookings');
    }

    // Requested date must be today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      throw new BadRequestException('Cannot check availability for past dates');
    }

    // Check if the provider has blocked this date
    const isBlocked = await this.bookingRepo.isDateBlocked(providerId, requestedDate);
    if (isBlocked) {
      return [];
    }

    // Get the provider's schedule for this day of the week
    const schedule = provider.availabilitySchedule as AvailabilitySchedule | null;
    const dayName = this.getDayName(requestedDate);
    const dayRanges = schedule?.[dayName];

    // No schedule defined for this day means the provider is unavailable
    if (!dayRanges || dayRanges.length === 0) {
      return [];
    }

    // Generate all possible slots from the day's time ranges
    const allSlots: AvailableSlot[] = [];
    for (const range of dayRanges) {
      const [start, end] = range.split('-');
      const slots = this.generateSlots(start, end, slotDurationMinutes);
      allSlots.push(...slots);
    }

    // Fetch existing bookings for this provider on this date to exclude taken slots
    const existingBookings = await this.bookingRepo.findByProviderAndDate(
      providerId,
      requestedDate,
    );
    const bookedStartTimes = new Set(
      existingBookings
        .filter((b) => b.status !== 'CANCELLED') // Cancelled bookings free up slots
        .map((b) => b.startTime),
    );

    // Filter out booked slots
    return allSlots.filter((slot) => !bookedStartTimes.has(slot.startTime));
  }

  /**
   * Maps a Date to the lowercase day name used in availabilitySchedule.
   */
  private getDayName(date: Date): string {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[date.getDay()];
  }

  /**
   * Generates fixed-duration time slots between a start and end time.
   * Example: generateSlots("09:00", "12:00", 60) => 09:00-10:00, 10:00-11:00, 11:00-12:00
   */
  private generateSlots(
    start: string,
    end: string,
    durationMinutes: number,
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    let currentMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    while (currentMinutes + durationMinutes <= endMinutes) {
      slots.push({
        startTime: this.minutesToTime(currentMinutes),
        endTime: this.minutesToTime(currentMinutes + durationMinutes),
        durationMinutes,
      });
      currentMinutes += durationMinutes;
    }

    return slots;
  }

  /** Converts "HH:mm" to total minutes since midnight. */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /** Converts total minutes since midnight back to "HH:mm". */
  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
