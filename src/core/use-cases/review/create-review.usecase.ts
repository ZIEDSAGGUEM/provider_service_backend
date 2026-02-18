import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IReviewRepository } from '../../repositories/review.repository.interface';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { RequestStatus } from '@prisma/client';

export interface CreateReviewData {
  requestId: string;
  rating: number;
  comment: string;
}

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
    @Inject('IServiceRequestRepository')
    private readonly requestRepository: IServiceRequestRepository,
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(userId: string, data: CreateReviewData) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Get the service request
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Verify the request is COMPLETED
    if (request.status !== RequestStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed service requests');
    }

    // Verify the user is the client of this request
    if (request.clientId !== userId) {
      throw new ForbiddenException('You can only review your own service requests');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findByRequestId(data.requestId);
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this service request');
    }

    // Create the review
    const review = await this.reviewRepository.create({
      requestId: data.requestId,
      clientId: userId,
      providerId: request.providerId,
      rating: data.rating,
      comment: data.comment,
    });

    // Update provider's rating
    const { rating, count } = await this.reviewRepository.calculateProviderRating(request.providerId);
    await this.providerRepository.updateRating(request.providerId, rating, count);

    return review;
  }
}

