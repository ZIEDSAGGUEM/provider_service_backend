import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { BlockDateDto } from './dto/block-date.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserEntity } from '../../../core/entities/user.entity';
import { BookingStatus } from '../../../core/entities/booking.entity';
import { EventsGateway } from '../../gateways/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { NotificationType } from '../../../core/entities/notification.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  private readonly logger = new Logger(BookingsController.name);

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Notification Helpers ─────────────────────────────────────────────────────

  /**
   * Sends a real-time notification to the other party when a booking status changes.
   * Follows the same pattern used in ServiceRequestsController.
   */
  private async notifyBookingChange(
    bookingId: string,
    eventType: string,
    actorName: string,
    recipientUserId: string,
    bookingDate: string,
  ) {
    const messages: Record<string, { type: NotificationType; title: string; body: string }> = {
      CREATED: {
        type: 'BOOKING_CREATED' as NotificationType,
        title: 'New Booking Request',
        body: `${actorName} requested a booking on ${bookingDate}`,
      },
      CONFIRMED: {
        type: 'BOOKING_CONFIRMED' as NotificationType,
        title: 'Booking Confirmed',
        body: `${actorName} confirmed your booking on ${bookingDate}`,
      },
      RESCHEDULED: {
        type: 'BOOKING_RESCHEDULED' as NotificationType,
        title: 'Booking Rescheduled',
        body: `${actorName} rescheduled the booking to ${bookingDate}`,
      },
      CANCELLED: {
        type: 'BOOKING_CANCELLED' as NotificationType,
        title: 'Booking Cancelled',
        body: `${actorName} cancelled the booking on ${bookingDate}`,
      },
    };

    const msg = messages[eventType];
    if (!msg) return;

    try {
      const notification = await this.notificationsService.create({
        userId: recipientUserId,
        type: msg.type,
        title: msg.title,
        body: msg.body,
        data: { bookingId },
      });

      this.eventsGateway.emitNotification(recipientUserId, notification);
      this.eventsGateway.emitToUser(recipientUserId, 'bookingStatusUpdate', {
        bookingId,
        status: eventType,
      });
    } catch (err) {
      this.logger.warn('Failed to send booking notification', err);
    }
  }

  /**
   * Resolves the recipient user ID for a booking notification.
   * The recipient is always the other party (not the actor).
   */
  private async getBookingRecipient(
    bookingId: string,
    actorUserId: string,
  ): Promise<{ recipientUserId: string; date: string } | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        clientId: true,
        date: true,
        startTime: true,
        provider: { select: { userId: true } },
      },
    });
    if (!booking) return null;

    const recipientUserId =
      booking.clientId === actorUserId
        ? booking.provider?.userId
        : booking.clientId;

    const dateStr = `${booking.date.toISOString().split('T')[0]} at ${booking.startTime}`;
    return recipientUserId ? { recipientUserId, date: dateStr } : null;
  }

  // ─── Availability Endpoints ───────────────────────────────────────────────────

  /** Get available time slots for a provider on a given date. */
  @Get('slots/:providerId')
  @Roles(UserRole.CLIENT, UserRole.PROVIDER)
  async getAvailableSlots(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    this.logger.log(`Fetching available slots for provider: ${providerId}, date: ${date}`);
    const slotDuration = duration ? parseInt(duration, 10) : undefined;
    return this.bookingsService.getAvailableSlots(providerId, date, slotDuration);
  }

  // ─── Booking CRUD Endpoints ───────────────────────────────────────────────────

  /** Create a new booking (clients only). */
  @Post()
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Client ${user.id} creating booking with provider ${dto.providerId}`);
    const booking = await this.bookingsService.createBooking(user.id, dto);
    const response = new BookingResponseDto(booking);

    // Notify the provider about the new booking
    const info = await this.getBookingRecipient(booking.id, user.id);
    if (info) {
      await this.notifyBookingChange(booking.id, 'CREATED', user.name, info.recipientUserId, info.date);
    }

    return response;
  }

  /** Get a specific booking by ID. */
  @Get(':id')
  @Roles(UserRole.CLIENT, UserRole.PROVIDER)
  async getBooking(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    this.logger.log(`User ${user.id} fetching booking ${id}`);
    const booking = await this.bookingsService.getBooking(id, user.id);
    return new BookingResponseDto(booking);
  }

  /** List all bookings for the authenticated client. */
  @Get('my/client')
  @Roles(UserRole.CLIENT)
  async getClientBookings(
    @CurrentUser() user: UserEntity,
    @Query('status') status?: BookingStatus,
  ): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching bookings for client: ${user.id}`);
    const bookings = await this.bookingsService.getClientBookings(user.id, status);
    return bookings.map((b) => new BookingResponseDto(b));
  }

  /** List all bookings for the authenticated provider. */
  @Get('my/provider')
  @Roles(UserRole.PROVIDER)
  async getProviderBookings(
    @CurrentUser() user: UserEntity,
    @Query('status') status?: BookingStatus,
  ): Promise<BookingResponseDto[]> {
    this.logger.log(`Fetching bookings for provider: ${user.id}`);
    const bookings = await this.bookingsService.getProviderBookings(user.id, status);
    return bookings.map((b) => new BookingResponseDto(b));
  }

  // ─── Booking Lifecycle Endpoints ──────────────────────────────────────────────

  /** Provider confirms a pending booking. */
  @Put(':id/confirm')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async confirmBooking(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmBookingDto,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Provider ${user.id} confirming booking ${id}`);
    const booking = await this.bookingsService.confirmBooking(id, user.id, dto.providerNotes);

    const info = await this.getBookingRecipient(id, user.id);
    if (info) {
      await this.notifyBookingChange(id, 'CONFIRMED', user.name, info.recipientUserId, info.date);
    }

    return new BookingResponseDto(booking);
  }

  /** Either party reschedules a booking to a new date/time. */
  @Put(':id/reschedule')
  @Roles(UserRole.CLIENT, UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async rescheduleBooking(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RescheduleBookingDto,
  ): Promise<BookingResponseDto> {
    this.logger.log(`User ${user.id} rescheduling booking ${id}`);
    const booking = await this.bookingsService.rescheduleBooking(id, user.id, dto);

    const info = await this.getBookingRecipient(id, user.id);
    if (info) {
      await this.notifyBookingChange(id, 'RESCHEDULED', user.name, info.recipientUserId, info.date);
    }

    return new BookingResponseDto(booking);
  }

  /** Either party cancels a booking. */
  @Put(':id/cancel')
  @Roles(UserRole.CLIENT, UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    this.logger.log(`User ${user.id} cancelling booking ${id}`);

    // Capture recipient before cancellation
    const info = await this.getBookingRecipient(id, user.id);

    const booking = await this.bookingsService.cancelBooking(id, user.id, dto.reason);

    if (info) {
      await this.notifyBookingChange(id, 'CANCELLED', user.name, info.recipientUserId, info.date);
    }

    return new BookingResponseDto(booking);
  }

  // ─── Blocked Dates (Provider Only) ────────────────────────────────────────────

  /** Block a date so no bookings can be made. */
  @Post('blocked-dates')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  async blockDate(
    @CurrentUser() user: UserEntity,
    @Body() dto: BlockDateDto,
  ) {
    this.logger.log(`Provider ${user.id} blocking date ${dto.date}`);
    return this.bookingsService.blockDate(user.id, dto.date, dto.reason);
  }

  /** List all blocked dates for the authenticated provider. */
  @Get('blocked-dates/my')
  @Roles(UserRole.PROVIDER)
  async getBlockedDates(@CurrentUser() user: UserEntity) {
    this.logger.log(`Fetching blocked dates for provider: ${user.id}`);
    return this.bookingsService.getBlockedDates(user.id);
  }

  /** Remove a blocked date. */
  @Delete('blocked-dates/:id')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unblockDate(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.logger.log(`Provider ${user.id} unblocking date ${id}`);
    await this.bookingsService.unblockDate(user.id, id);
  }
}
