import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './application/modules/auth/auth.module';
import { ProvidersModule } from './application/modules/providers/providers.module';
import { CategoriesModule } from './application/modules/categories/categories.module';
import { ServiceRequestsModule } from './application/modules/service-requests/service-requests.module';
import { ReviewsModule } from './application/modules/reviews/reviews.module';
import { MessagesModule } from './application/modules/messages/messages.module';
import { AiModule } from './application/modules/ai/ai.module';
import { FavoritesModule } from './application/modules/favorites/favorites.module';
import { NotificationsModule } from './application/modules/notifications/notifications.module';
import { EventsModule } from './application/gateways/events.module';
import { UploadsModule } from './application/modules/uploads/uploads.module';
import { AdminModule } from './application/modules/admin/admin.module';
import { DisputesModule } from './application/modules/disputes/disputes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    ProvidersModule,
    CategoriesModule,
    ServiceRequestsModule,
    ReviewsModule,
    MessagesModule,
    AiModule,
    FavoritesModule,
    NotificationsModule,
    EventsModule,
    UploadsModule,
    AdminModule,
    DisputesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
