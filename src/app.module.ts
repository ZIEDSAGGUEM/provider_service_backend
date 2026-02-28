import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
