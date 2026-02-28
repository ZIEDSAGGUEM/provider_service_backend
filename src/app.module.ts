import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './application/modules/auth/auth.module';
import { ProvidersModule } from './application/modules/providers/providers.module';
import { CategoriesModule } from './application/modules/categories/categories.module';
import { ServiceRequestsModule } from './application/modules/service-requests/service-requests.module';
import { ReviewsModule } from './application/modules/reviews/reviews.module';
import { MessagesModule } from './application/modules/messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProvidersModule,
    CategoriesModule,
    ServiceRequestsModule,
    ReviewsModule,
    MessagesModule,
  ],
})
export class AppModule {}
