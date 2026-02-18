import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IReviewRepository, CreateReviewData } from '../../../core/repositories/review.repository.interface';
import { ReviewEntity } from '../../../core/entities/review.entity';

@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(review: any): ReviewEntity {
    return new ReviewEntity({
      id: review.id,
      requestId: review.requestId,
      clientId: review.clientId,
      providerId: review.providerId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      client: review.client ? {
        id: review.client.id,
        name: review.client.name,
        avatar: review.client.avatar,
      } : undefined,
    });
  }

  async create(data: CreateReviewData): Promise<ReviewEntity> {
    const review = await this.prisma.review.create({
      data: {
        requestId: data.requestId,
        clientId: data.clientId,
        providerId: data.providerId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    return this.mapToEntity(review);
  }

  async findById(id: string): Promise<ReviewEntity | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    return review ? this.mapToEntity(review) : null;
  }

  async findByRequestId(requestId: string): Promise<ReviewEntity | null> {
    const review = await this.prisma.review.findUnique({
      where: { requestId },
    });

    return review ? this.mapToEntity(review) : null;
  }

  async findByProviderId(providerId: string): Promise<ReviewEntity[]> {
    const reviews = await this.prisma.review.findMany({
      where: { providerId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map(this.mapToEntity);
  }

  async findByClientId(clientId: string): Promise<ReviewEntity[]> {
    const reviews = await this.prisma.review.findMany({
      where: { clientId },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map(this.mapToEntity);
  }

  async calculateProviderRating(providerId: string): Promise<{ rating: number; count: number }> {
    const result = await this.prisma.review.aggregate({
      where: { providerId },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      rating: result._avg.rating || 0,
      count: result._count.id || 0,
    };
  }
}

