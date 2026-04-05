import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaBookingRepository } from '../../../infrastructure/database/repositories/prisma-booking.repository';
import { PrismaUserRepository } from '../../../infrastructure/database/repositories/prisma-user.repository';
import { PrismaProviderRepository } from '../../../infrastructure/database/repositories/prisma-provider.repository';

// Use cases
import { GetAvailableSlotsUseCase } from '../../../core/use-cases/booking/get-available-slots.usecase';
import { CreateBookingUseCase } from '../../../core/use-cases/booking/create-booking.usecase';
import { ConfirmBookingUseCase } from '../../../core/use-cases/booking/confirm-booking.usecase';
import { RescheduleBookingUseCase } from '../../../core/use-cases/booking/reschedule-booking.usecase';
import { CancelBookingUseCase } from '../../../core/use-cases/booking/cancel-booking.usecase';
import { GetBookingUseCase } from '../../../core/use-cases/booking/get-booking.usecase';
import { GetProviderBookingsUseCase } from '../../../core/use-cases/booking/get-provider-bookings.usecase';
import { GetClientBookingsUseCase } from '../../../core/use-cases/booking/get-client-bookings.usecase';
import { ManageBlockedDatesUseCase } from '../../../core/use-cases/booking/manage-blocked-dates.usecase';

import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../../gateways/events.module';

@Module({
  imports: [PassportModule, AuthModule, EventsModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    PrismaService,

    // Repository bindings
    { provide: 'IBookingRepository', useClass: PrismaBookingRepository },
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
    { provide: 'IProviderRepository', useClass: PrismaProviderRepository },

    // Use cases
    GetAvailableSlotsUseCase,
    CreateBookingUseCase,
    ConfirmBookingUseCase,
    RescheduleBookingUseCase,
    CancelBookingUseCase,
    GetBookingUseCase,
    GetProviderBookingsUseCase,
    GetClientBookingsUseCase,
    ManageBlockedDatesUseCase,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
