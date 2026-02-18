import { ReviewEntity } from '../entities/review.entity';

export interface CreateReviewData {
  requestId: string;
  clientId: string;
  providerId: string;
  rating: number;
  comment: string;
}

export interface IReviewRepository {
  /**
   * Create a new review
   */
  create(data: CreateReviewData): Promise<ReviewEntity>;

  /**
   * Find a review by ID
   */
  findById(id: string): Promise<ReviewEntity | null>;

  /**
   * Find a review by request ID
   */
  findByRequestId(requestId: string): Promise<ReviewEntity | null>;

  /**
   * Get all reviews for a specific provider
   */
  findByProviderId(providerId: string): Promise<ReviewEntity[]>;

  /**
   * Get all reviews written by a specific client
   */
  findByClientId(clientId: string): Promise<ReviewEntity[]>;

  /**
   * Calculate average rating for a provider
   */
  calculateProviderRating(providerId: string): Promise<{ rating: number; count: number }>;
}

