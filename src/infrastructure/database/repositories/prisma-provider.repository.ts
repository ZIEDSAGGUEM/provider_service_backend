import { Injectable } from '@nestjs/common';
import { Prisma, AvailabilityStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import type {
  IProviderRepository,
  CreateProviderDto,
  UpdateProviderDto,
  ProviderSearchFilters,
} from '../../../core/repositories/provider.repository.interface';
import { ProviderEntity } from '../../../core/entities/provider.entity';

@Injectable()
export class PrismaProviderRepository implements IProviderRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProviderDto): Promise<ProviderEntity> {
    const provider = await this.prisma.provider.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        skills: data.skills,
        availability:
          (data.availability as AvailabilityStatus) ||
          AvailabilityStatus.AVAILABLE,
        availabilitySchedule:
          (data.availabilitySchedule as Prisma.InputJsonValue) ??
          Prisma.JsonNull,
        yearsExperience: data.yearsExperience || 0,
        serviceRadius: data.serviceRadius || 10,
        portfolio: data.portfolio || [],
        certifications: data.certifications || [],
      },
      include: {
        user: true,
        category: true,
      },
    });

    return new ProviderEntity(provider as unknown as Partial<ProviderEntity>);
  }

  async findById(id: string): Promise<ProviderEntity | null> {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
            location: true,
          },
        },
        category: true,
      },
    });

    return provider
      ? new ProviderEntity(provider as unknown as Partial<ProviderEntity>)
      : null;
  }

  async findByUserId(userId: string): Promise<ProviderEntity | null> {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
            location: true,
          },
        },
        category: true,
      },
    });

    return provider
      ? new ProviderEntity(provider as unknown as Partial<ProviderEntity>)
      : null;
  }

  async findAll(filters?: ProviderSearchFilters): Promise<ProviderEntity[]> {
    const where: Prisma.ProviderWhereInput = {};

    if (filters) {
      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }
      if (filters.minRating) {
        where.rating = { gte: filters.minRating };
      }
      if (filters.maxHourlyRate) {
        where.hourlyRate = { lte: filters.maxHourlyRate };
      }
      if (filters.skills && filters.skills.length > 0) {
        where.skills = { hasSome: filters.skills };
      }
      if (filters.availability) {
        where.availability = filters.availability as AvailabilityStatus;
      }
      if (filters.status) {
        where.status =
          filters.status as unknown as Prisma.EnumProviderStatusFilter;
      } else {
        where.status = 'ACTIVE';
      }
      if (filters.verified !== undefined) {
        where.verified = filters.verified;
      }

      if (filters.location) {
        where.user = {
          ...(where.user as Prisma.UserWhereInput),
          location: { contains: filters.location, mode: 'insensitive' },
        };
      }

      if (filters.q) {
        const q = filters.q;
        where.OR = [
          { user: { name: { contains: q, mode: 'insensitive' } } },
          { bio: { contains: q, mode: 'insensitive' } },
          { skills: { hasSome: [q] } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
        ];
      }
    } else {
      where.status = 'ACTIVE';
    }

    const providers = await this.prisma.provider.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
          },
        },
        category: true,
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    });

    return providers.map(
      (p) => new ProviderEntity(p as unknown as Partial<ProviderEntity>),
    );
  }

  async update(id: string, data: UpdateProviderDto): Promise<ProviderEntity> {
    const updateData: Prisma.ProviderUpdateInput = {};

    if (data.categoryId !== undefined)
      updateData.category = { connect: { id: data.categoryId } };
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.availability !== undefined)
      updateData.availability = data.availability as AvailabilityStatus;
    if (data.availabilitySchedule !== undefined)
      updateData.availabilitySchedule =
        (data.availabilitySchedule as Prisma.InputJsonValue) ?? Prisma.JsonNull;
    if (data.yearsExperience !== undefined)
      updateData.yearsExperience = data.yearsExperience;
    if (data.responseTime !== undefined)
      updateData.responseTime = data.responseTime;
    if (data.serviceRadius !== undefined)
      updateData.serviceRadius = data.serviceRadius;
    if (data.portfolio !== undefined) updateData.portfolio = data.portfolio;
    if (data.certifications !== undefined)
      updateData.certifications = data.certifications;
    if (data.status !== undefined)
      updateData.status =
        data.status as Prisma.EnumProviderStatusFieldUpdateOperationsInput['set'];
    if (data.verified !== undefined) updateData.verified = data.verified;

    const provider = await this.prisma.provider.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        category: true,
      },
    });

    return new ProviderEntity(provider as unknown as Partial<ProviderEntity>);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.provider.delete({
      where: { id },
    });
  }

  async updateRating(
    id: string,
    rating: number,
    reviewCount: number,
  ): Promise<ProviderEntity> {
    const provider = await this.prisma.provider.update({
      where: { id },
      data: {
        rating,
        reviewCount,
      },
      include: {
        user: true,
        category: true,
      },
    });

    return new ProviderEntity(provider as unknown as Partial<ProviderEntity>);
  }

  async incrementCompletedJobs(id: string): Promise<ProviderEntity> {
    const provider = await this.prisma.provider.update({
      where: { id },
      data: {
        completedJobs: {
          increment: 1,
        },
      },
      include: {
        user: true,
        category: true,
      },
    });

    return new ProviderEntity(provider as unknown as Partial<ProviderEntity>);
  }
}
