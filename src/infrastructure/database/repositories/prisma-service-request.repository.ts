import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IServiceRequestRepository,
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
  ServiceRequestFilters,
} from '../../../core/repositories/service-request.repository.interface';
import { ServiceRequestEntity, RequestStatus } from '../../../core/entities/service-request.entity';

@Injectable()
export class PrismaServiceRequestRepository implements IServiceRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(request: any): ServiceRequestEntity {
    return new ServiceRequestEntity({
      id: request.id,
      clientId: request.clientId,
      providerId: request.providerId,
      categoryId: request.categoryId,
      title: request.title,
      description: request.description,
      location: request.location,
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      scheduledDate: request.scheduledDate,
      estimatedBudget: request.estimatedBudget,
      finalPrice: request.finalPrice,
      status: request.status as RequestStatus,
      cancelledBy: request.cancelledBy,
      cancelReason: request.cancelReason,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      client: request.client ? {
        id: request.client.id,
        name: request.client.name,
        email: request.client.email,
        avatar: request.client.avatar,
        phone: request.client.phone,
        location: request.client.location,
      } : undefined,
      provider: request.provider ? {
        id: request.provider.id,
        userId: request.provider.userId,
        categoryId: request.provider.categoryId,
        hourlyRate: request.provider.hourlyRate,
        rating: request.provider.rating,
        reviewCount: request.provider.reviewCount,
        user: request.provider.user ? {
          id: request.provider.user.id,
          name: request.provider.user.name,
          avatar: request.provider.user.avatar,
          phone: request.provider.user.phone,
          location: request.provider.user.location,
        } : undefined,
        category: request.provider.category ? {
          id: request.provider.category.id,
          name: request.provider.category.name,
          icon: request.provider.category.icon,
        } : undefined,
      } : undefined,
      category: request.category ? {
        id: request.category.id,
        name: request.category.name,
        icon: request.category.icon,
        description: request.category.description,
      } : undefined,
    });
  }

  async create(data: CreateServiceRequestDto): Promise<ServiceRequestEntity> {
    const request = await this.prisma.serviceRequest.create({
      data: {
        clientId: data.clientId,
        providerId: data.providerId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        location: data.location,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        estimatedBudget: data.estimatedBudget,
        status: RequestStatus.PENDING,
      },
      include: {
        client: true,
        provider: {
          include: {
            user: true,
            category: true,
          },
        },
        category: true,
      },
    });

    return this.mapToEntity(request);
  }

  async findById(id: string): Promise<ServiceRequestEntity | null> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: true,
        provider: {
          include: {
            user: true,
            category: true,
          },
        },
        category: true,
      },
    });

    return request ? this.mapToEntity(request) : null;
  }

  async findAll(filters?: ServiceRequestFilters): Promise<ServiceRequestEntity[]> {
    const where: any = {};

    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.providerId) where.providerId = filters.providerId;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.status) where.status = filters.status;
    
    if (filters?.fromDate || filters?.toDate) {
      where.preferredDate = {};
      if (filters.fromDate) where.preferredDate.gte = filters.fromDate;
      if (filters.toDate) where.preferredDate.lte = filters.toDate;
    }

    const requests = await this.prisma.serviceRequest.findMany({
      where,
      include: {
        client: true,
        provider: {
          include: {
            user: true,
            category: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests.map(this.mapToEntity);
  }

  async findByClient(clientId: string, filters?: ServiceRequestFilters): Promise<ServiceRequestEntity[]> {
    return this.findAll({ ...filters, clientId });
  }

  async findByProvider(providerId: string, filters?: ServiceRequestFilters): Promise<ServiceRequestEntity[]> {
    return this.findAll({ ...filters, providerId });
  }

  async update(id: string, data: UpdateServiceRequestDto): Promise<ServiceRequestEntity> {
    const request = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        estimatedBudget: data.estimatedBudget,
        scheduledDate: data.scheduledDate,
        finalPrice: data.finalPrice,
        status: data.status,
        cancelledBy: data.cancelledBy,
        cancelReason: data.cancelReason,
      },
      include: {
        client: true,
        provider: {
          include: {
            user: true,
            category: true,
          },
        },
        category: true,
      },
    });

    return this.mapToEntity(request);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.serviceRequest.delete({
      where: { id },
    });
  }
}

