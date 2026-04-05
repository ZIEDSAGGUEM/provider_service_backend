import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type {
  IBookingRepository,
  CreateBookingDto as RepoCreateBookingDto,
} from '../../repositories/booking.repository.interface';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { BookingEntity } from '../../entities/booking.entity';
import { UserRole } from '../../entities/user.entity';
import { ProviderStatus } from '../../entities/provider.entity';

export interface CreateBookingInput {
  providerId: string;
  serviceRequestId?: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  notes?: string;
}

/**
 * Creates a new booking after validating:
 * - Client exists and has the CLIENT role
 * - Provider exists and is active
 * - Requested date is not in the past and not blocked
 * - Time slot is still available (race-condition-safe via DB unique constraint)
 */
@Injectable()
export class CreateBookingUseCase {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    @Inject('IProviderRepository')
    private readonly providerRepo: IProviderRepository,
  ) {}

  async execute(
    clientId: string,
    data: CreateBookingInput,
  ): Promise<BookingEntity> {
    // Validate client
    const client = await this.userRepo.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (client.role !== UserRole.CLIENT) {
      throw new BadRequestException('Only clients can create bookings');
    }

    // Validate provider
    const provider = await this.providerRepo.findById(data.providerId);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    if (provider.status !== ProviderStatus.ACTIVE) {
      throw new BadRequestException('Provider is not currently accepting bookings');
    }

    // Parse and validate date
    const bookingDate = new Date(data.date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      throw new BadRequestException('Booking date must be today or in the future');
    }

    // Check if the date is blocked
    const isBlocked = await this.bookingRepo.isDateBlocked(data.providerId, bookingDate);
    if (isBlocked) {
      throw new BadRequestException('Provider is not available on this date');
    }

    // Validate time format and calculate duration
    this.validateTimeFormat(data.startTime);
    this.validateTimeFormat(data.endTime);
    const durationMinutes = this.calculateDuration(data.startTime, data.endTime);
    if (durationMinutes <= 0) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check slot availability
    const isAvailable = await this.bookingRepo.isSlotAvailable(
      data.providerId,
      bookingDate,
      data.startTime,
    );
    if (!isAvailable) {
      throw new BadRequestException('This time slot is no longer available');
    }

    // Create the booking
    const createData: RepoCreateBookingDto = {
      clientId,
      providerId: data.providerId,
      serviceRequestId: data.serviceRequestId,
      date: bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      durationMinutes,
      notes: data.notes,
    };

    return this.bookingRepo.create(createData);
  }

  /** Validates HH:mm time format. */
  private validateTimeFormat(time: string): void {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time)) {
      throw new BadRequestException(
        `Invalid time format: ${time}. Expected HH:mm (e.g., "09:00")`,
      );
    }
  }

  /** Calculates duration in minutes between two HH:mm times. */
  private calculateDuration(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  }
}
