import { Inject, Injectable } from '@nestjs/common';
import type { IProviderRepository, CreateProviderDto } from '../../repositories/provider.repository.interface';
import type { ICategoryRepository } from '../../repositories/category.repository.interface';
import { ProviderEntity } from '../../entities/provider.entity';

@Injectable()
export class CreateProviderUseCase {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(data: CreateProviderDto): Promise<ProviderEntity> {
    // Check if user already has a provider profile
    const existingProvider = await this.providerRepository.findByUserId(data.userId);
    if (existingProvider) {
      throw new Error('Provider profile already exists for this user');
    }

    // Verify category exists
    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Create provider profile
    const provider = await this.providerRepository.create(data);

    // Increment category provider count
    await this.categoryRepository.incrementProviderCount(data.categoryId);

    return provider;
  }
}

