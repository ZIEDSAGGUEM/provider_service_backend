import { Injectable, Inject } from '@nestjs/common';
import type { IReviewRepository } from '../../repositories/review.repository.interface';

@Injectable()
export class GetProviderReviewsUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(providerId: string) {
    return this.reviewRepository.findByProviderId(providerId);
  }
}

