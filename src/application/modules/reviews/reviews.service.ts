import { Injectable } from '@nestjs/common';
import { CreateReviewUseCase } from '../../../core/use-cases/review/create-review.usecase';
import { GetProviderReviewsUseCase } from '../../../core/use-cases/review/get-provider-reviews.usecase';
import { ReviewEntity } from '../../../core/entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getProviderReviewsUseCase: GetProviderReviewsUseCase,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto): Promise<ReviewEntity> {
    return this.createReviewUseCase.execute(userId, {
      requestId: dto.requestId,
      rating: dto.rating,
      comment: dto.comment,
    });
  }

  async getProviderReviews(providerId: string): Promise<ReviewEntity[]> {
    return this.getProviderReviewsUseCase.execute(providerId);
  }
}

