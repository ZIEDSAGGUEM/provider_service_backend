import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  IBookingRepository,
  CreateBookingDto,
  UpdateBookingDto,
  BookingFilters,
  CreateBlockedDateDto,
} from '../../../core/repositories/booking.repository.interface';
import {
  BookingEntity,
  BookingStatus,
  BlockedDateEntity,
} from '../../../core/entities/booking.entity';

/** Prisma return type with all booking relations included. */
type PrismaBookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    client: true;
    provider: { include: { user: true; category: true } };
    serviceRequest: true;
  };
}>;

@Injectable()
export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Mapping ──────────────────────────────────────────────────────────────────

  /** Maps a raw Prisma booking record to a domain entity. */
  private mapToEntity(booking: PrismaBookingWithRelations): BookingEntity {
    return new BookingEntity({
      id: booking.id,
      clientId: booking.clientId,
      providerId: booking.providerId,
      serviceRequestId: booking.serviceRequestId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      cancelledBy: booking.cancelledBy,
      cancelReason: booking.cancelReason,
      notes: booking.notes,
      providerNotes: booking.providerNotes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      client: booking.client
        ? {
            id: booking.client.id,
            name: booking.client.name,
            email: booking.client.email,
            avatar: booking.client.avatar,
            phone: booking.client.phone,
            location: booking.client.location,
          }
        : undefined,
      provider: booking.provider
        ? {
            id: booking.provider.id,
            userId: booking.provider.userId,
            categoryId: booking.provider.categoryId,
            hourlyRate: booking.provider.hourlyRate,
            rating: booking.provider.rating,
            reviewCount: booking.provider.reviewCount,
            user: booking.provider.user
              ? {
                  id: booking.provider.user.id,
                  name: booking.provider.user.name,
                  avatar: booking.provider.user.avatar,
                  phone: booking.provider.user.phone,
                  location: booking.provider.user.location,
                }
              : undefined,
            category: booking.provider.category
              ? {
                  id: booking.provider.category.id,
                  name: booking.provider.category.name,
                  icon: booking.provider.category.icon,
                }
              : undefined,
          }
        : undefined,
      serviceRequest: booking.serviceRequest
        ? {
            id: booking.serviceRequest.id,
            title: booking.serviceRequest.title,
            status: booking.serviceRequest.status,
          }
        : undefined,
    });
  }

  /** Standard include clause used across all queries. */
  private get includeRelations() {
    return {
      client: true,
      provider: {
        include: {
          user: true,
          category: true,
        },
      },
      serviceRequest: true,
    } as const;
  }

  // ─── Booking CRUD ─���───────────────────────────────────────────────────────────

  async create(data: CreateBookingDto): Promise<BookingEntity> {
    const booking = await this.prisma.booking.create({
      data: {
        clientId: data.clientId,
        providerId: data.providerId,
        serviceRequestId: data.serviceRequestId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
        status: BookingStatus.PENDING,
      },
      include: this.includeRelations,
    });

    return this.mapToEntity(booking);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    return booking ? this.mapToEntity(booking) : null;
  }

  async findAll(filters?: BookingFilters): Promise<BookingEntity[]> {
    const where = this.buildWhereClause(filters);

    const bookings = await this.prisma.booking.findMany({
      where,
      include: this.includeRelations,
      orderBy: { date: 'asc' },
    });

    return bookings.map((b) => this.mapToEntity(b));
  }

  async findByClient(
    clientId: string,
    filters?: BookingFilters,
  ): Promise<BookingEntity[]> {
    return this.findAll({ ...filters, clientId });
  }

  async findByProvider(
    providerId: string,
    filters?: BookingFilters,
  ): Promise<BookingEntity[]> {
    return this.findAll({ ...filters, providerId });
  }

  async update(id: string, data: UpdateBookingDto): Promise<BookingEntity> {
    const updateData: Prisma.BookingUpdateInput = {};
    if (data.date !== undefined) updateData.date = data.date;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.cancelledBy !== undefined) updateData.cancelledBy = data.cancelledBy;
    if (data.cancelReason !== undefined) updateData.cancelReason = data.cancelReason;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.providerNotes !== undefined) updateData.providerNotes = data.providerNotes;

    const booking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: this.includeRelations,
    });

    return this.mapToEntity(booking);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.booking.delete({ where: { id } });
  }

  // ─── Availability Checks ──────────────────────────────────────────────────────

  /**
   * Returns all non-cancelled bookings for a provider on a specific date.
   * Used by the availability engine to determine taken time slots.
   */
  async findByProviderAndDate(
    providerId: string,
    date: Date,
  ): Promise<BookingEntity[]> {
    // Normalize to date-only boundaries for accurate comparison
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        providerId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: BookingStatus.CANCELLED },
      },
      include: this.includeRelations,
      orderBy: { startTime: 'asc' },
    });

    return bookings.map((b) => this.mapToEntity(b));
  }

  /**
   * Checks if a specific time slot is available for a provider on a date.
   * Returns true if no active booking exists at that slot.
   */
  async isSlotAvailable(
    providerId: string,
    date: Date,
    startTime: string,
  ): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await this.prisma.booking.findFirst({
      where: {
        providerId,
        date: { gte: startOfDay, lte: endOfDay },
        startTime,
        status: { not: BookingStatus.CANCELLED },
      },
    });

    return !existing;
  }

  // ─── Blocked Dates ────��───────────────────────────────────────────────────────

  async createBlockedDate(data: CreateBlockedDateDto): Promise<BlockedDateEntity> {
    const blocked = await this.prisma.blockedDate.create({
      data: {
        providerId: data.providerId,
        date: data.date,
        reason: data.reason,
      },
    });

    return new BlockedDateEntity(blocked);
  }

  async findBlockedDates(
    providerId: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<BlockedDateEntity[]> {
    const where: Prisma.BlockedDateWhereInput = { providerId };

    if (fromDate || toDate) {
      const dateFilter: Record<string, Date> = {};
      if (fromDate) dateFilter.gte = fromDate;
      if (toDate) dateFilter.lte = toDate;
      where.date = dateFilter;
    }

    const blocked = await this.prisma.blockedDate.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return blocked.map((b) => new BlockedDateEntity(b));
  }

  async isDateBlocked(providerId: string, date: Date): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const blocked = await this.prisma.blockedDate.findFirst({
      where: {
        providerId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    return !!blocked;
  }

  async deleteBlockedDate(id: string): Promise<void> {
    await this.prisma.blockedDate.delete({ where: { id } });
  }

  // ─── Helpers ───────────────────────────────��──────────────────────────────────

  /** Builds Prisma where clause from booking filters. */
  private buildWhereClause(
    filters?: BookingFilters,
  ): Prisma.BookingWhereInput {
    const where: Prisma.BookingWhereInput = {};

    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.providerId) where.providerId = filters.providerId;
    if (filters?.status) where.status = filters.status;

    if (filters?.fromDate || filters?.toDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters?.fromDate) dateFilter.gte = filters.fromDate;
      if (filters?.toDate) dateFilter.lte = filters.toDate;
      where.date = dateFilter;
    }

    return where;
  }
}
