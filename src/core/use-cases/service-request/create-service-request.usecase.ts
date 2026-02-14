import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import type { IServiceRequestRepository, CreateServiceRequestDto } from '../../repositories/service-request.repository.interface';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import type { ICategoryRepository } from '../../repositories/category.repository.interface';
import { ServiceRequestEntity } from '../../entities/service-request.entity';
import { UserRole } from '../../entities/user.entity';
import { ProviderStatus } from '../../entities/provider.entity';

@Injectable()
export class CreateServiceRequestUseCase {
  constructor(
    @Inject('IServiceRequestRepository') private readonly requestRepository: IServiceRequestRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IProviderRepository') private readonly providerRepository: IProviderRepository,
    @Inject('ICategoryRepository') private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(clientId: string, data: Omit<CreateServiceRequestDto, 'clientId'>): Promise<ServiceRequestEntity> {
    // Validate client exists and is a CLIENT role
    const client = await this.userRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (client.role !== UserRole.CLIENT) {
      throw new BadRequestException('Only clients can create service requests');
    }

    // Validate provider exists and is active
    const provider = await this.providerRepository.findById(data.providerId);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    if (provider.status !== ProviderStatus.ACTIVE) {
      throw new BadRequestException('Provider is not currently accepting requests');
    }

    // Validate category exists
    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate that provider offers this category
    if (provider.categoryId !== data.categoryId) {
      throw new BadRequestException('Provider does not offer services in this category');
    }

    // Validate preferred date is in the future
    const preferredDate = new Date(data.preferredDate);
    if (preferredDate < new Date()) {
      throw new BadRequestException('Preferred date must be in the future');
    }

    // Create the service request
    return this.requestRepository.create({
      ...data,
      clientId,
      preferredDate,
    });
  }
}

