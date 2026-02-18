import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaReviewRepository } from '../../../infrastructure/database/repositories/prisma-review.repository';
import { PrismaServiceRequestRepository } from '../../../infrastructure/database/repositories/prisma-service-request.repository';
import { PrismaProviderRepository } from '../../../infrastructure/database/repositories/prisma-provider.repository';
import { CreateReviewUseCase } from '../../../core/use-cases/review/create-review.usecase';
import { GetProviderReviewsUseCase } from '../../../core/use-cases/review/get-provider-reviews.usecase';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PassportModule, AuthModule],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    PrismaService,
    {
      provide: 'IReviewRepository',
      useClass: PrismaReviewRepository,
    },
    {
      provide: 'IServiceRequestRepository',
      useClass: PrismaServiceRequestRepository,
    },
    {
      provide: 'IProviderRepository',
      useClass: PrismaProviderRepository,
    },
    CreateReviewUseCase,
    GetProviderReviewsUseCase,
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}

