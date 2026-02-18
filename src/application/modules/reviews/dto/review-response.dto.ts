import { ReviewEntity } from '../../../../core/entities/review.entity';

export class ReviewResponseDto {
  id: string;
  requestId: string;
  clientId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    name: string;
    avatar?: string | null;
  };

  constructor(review: ReviewEntity) {
    this.id = review.id;
    this.requestId = review.requestId;
    this.clientId = review.clientId;
    this.providerId = review.providerId;
    this.rating = review.rating;
    this.comment = review.comment;
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
    this.client = review.client;
  }
}

