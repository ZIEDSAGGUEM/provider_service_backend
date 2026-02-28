import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProviderUseCase } from '../../../core/use-cases/provider/create-provider.usecase';
import { GetProviderUseCase } from '../../../core/use-cases/provider/get-provider.usecase';
import { GetMyProviderUseCase } from '../../../core/use-cases/provider/get-my-provider.usecase';
import { UpdateProviderUseCase } from '../../../core/use-cases/provider/update-provider.usecase';
import { SearchProvidersUseCase } from '../../../core/use-cases/provider/search-providers.usecase';
import { DeleteProviderUseCase } from '../../../core/use-cases/provider/delete-provider.usecase';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';
import type { CreateProviderDto as CreateProviderUseCaseDto } from '../../../core/repositories/provider.repository.interface';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly createProviderUseCase: CreateProviderUseCase,
    private readonly getProviderUseCase: GetProviderUseCase,
    private readonly getMyProviderUseCase: GetMyProviderUseCase,
    private readonly updateProviderUseCase: UpdateProviderUseCase,
    private readonly searchProvidersUseCase: SearchProvidersUseCase,
    private readonly deleteProviderUseCase: DeleteProviderUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async createProvider(userId: string, dto: CreateProviderDto): Promise<ProviderResponseDto> {
    const data: CreateProviderUseCaseDto = {
      userId,
      categoryId: dto.categoryId,
      bio: dto.bio,
      hourlyRate: dto.hourlyRate,
      skills: dto.skills,
      availability: dto.availability,
      availabilitySchedule: dto.availabilitySchedule,
      yearsExperience: dto.yearsExperience,
      serviceRadius: dto.serviceRadius,
      portfolio: dto.portfolio,
      certifications: dto.certifications,
    };

    const provider = await this.createProviderUseCase.execute(data);
    return new ProviderResponseDto(provider);
  }

  async getProvider(id: string): Promise<ProviderResponseDto> {
    const provider = await this.getProviderUseCase.execute(id);
    return new ProviderResponseDto(provider);
  }

  async getMyProvider(userId: string): Promise<ProviderResponseDto> {
    const provider = await this.getMyProviderUseCase.execute(userId);
    return new ProviderResponseDto(provider);
  }

  async searchProviders(dto: SearchProvidersDto): Promise<ProviderResponseDto[]> {
    const providers = await this.searchProvidersUseCase.execute({
      q: dto.q,
      categoryId: dto.categoryId,
      minRating: dto.minRating,
      maxHourlyRate: dto.maxHourlyRate,
      skills: dto.skills,
      availability: dto.availability,
      status: dto.status,
      verified: dto.verified,
      location: dto.location,
      serviceRadius: dto.serviceRadius,
    });

    return providers.map((provider) => new ProviderResponseDto(provider));
  }

  async updateProvider(id: string, userId: string, dto: UpdateProviderDto): Promise<ProviderResponseDto> {
    const provider = await this.updateProviderUseCase.execute(id, userId, {
      categoryId: dto.categoryId,
      bio: dto.bio,
      hourlyRate: dto.hourlyRate,
      skills: dto.skills,
      availability: dto.availability,
      availabilitySchedule: dto.availabilitySchedule,
      yearsExperience: dto.yearsExperience,
      responseTime: dto.responseTime,
      serviceRadius: dto.serviceRadius,
      portfolio: dto.portfolio,
      certifications: dto.certifications,
    });

    return new ProviderResponseDto(provider);
  }

  async deleteProvider(id: string, userId: string): Promise<void> {
    await this.deleteProviderUseCase.execute(id, userId);
  }

  async getAnalytics(userId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider profile not found');

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      requestsByStatus,
      monthlyRequests,
      totalEarnings,
      recentReviews,
      ratingDistribution,
      favoritesCount,
    ] = await Promise.all([
      this.prisma.serviceRequest.groupBy({
        by: ['status'],
        where: { providerId: provider.id },
        _count: true,
      }),
      this.prisma.serviceRequest.findMany({
        where: {
          providerId: provider.id,
          createdAt: { gte: sixMonthsAgo },
        },
        select: { createdAt: true, status: true, finalPrice: true },
      }),
      this.prisma.serviceRequest.aggregate({
        where: { providerId: provider.id, status: 'COMPLETED' },
        _sum: { finalPrice: true },
        _count: true,
      }),
      this.prisma.review.findMany({
        where: { providerId: provider.id },
        include: { client: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { providerId: provider.id },
        _count: true,
      }),
      this.prisma.favorite.count({ where: { providerId: provider.id } }),
    ]);

    // Build status counts
    const statusCounts: Record<string, number> = { PENDING: 0, ACCEPTED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    for (const r of requestsByStatus) statusCounts[r.status] = r._count;

    // Build monthly chart data (last 6 months)
    const monthlyChart: { month: string; jobs: number; earnings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      let jobs = 0;
      let earnings = 0;
      for (const req of monthlyRequests) {
        const c = new Date(req.createdAt);
        if (c >= monthStart && c <= monthEnd) {
          jobs++;
          if (req.status === 'COMPLETED' && req.finalPrice) earnings += req.finalPrice;
        }
      }
      monthlyChart.push({ month: label, jobs, earnings });
    }

    // Rating distribution (1-5)
    const ratingDist = [0, 0, 0, 0, 0];
    for (const r of ratingDistribution) ratingDist[r.rating - 1] = r._count;

    return {
      totalEarnings: totalEarnings._sum.finalPrice || 0,
      totalCompletedJobs: totalEarnings._count,
      totalRequests: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      statusCounts,
      monthlyChart,
      ratingDistribution: ratingDist,
      recentReviews,
      favoritesCount,
    };
  }
}

