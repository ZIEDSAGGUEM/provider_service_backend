import { Inject, Injectable } from '@nestjs/common';
import type { IProviderRepository, UpdateProviderDto } from '../../repositories/provider.repository.interface';
import type { ICategoryRepository } from '../../repositories/category.repository.interface';
import { ProviderEntity } from '../../entities/provider.entity';

@Injectable()
export class UpdateProviderUseCase {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, userId: string, data: UpdateProviderDto): Promise<ProviderEntity> {
    const provider = await this.providerRepository.findById(id);
    
    if (!provider) {
      throw new Error('Provider not found');
    }

    // Ensure the provider belongs to the user
    if (provider.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own provider profile');
    }

    // If category is being changed, update counts
    if (data.categoryId && data.categoryId !== provider.categoryId) {
      const newCategory = await this.categoryRepository.findById(data.categoryId);
      if (!newCategory) {
        throw new Error('New category not found');
      }

      // Decrement old category, increment new category
      await this.categoryRepository.decrementProviderCount(provider.categoryId);
      await this.categoryRepository.incrementProviderCount(data.categoryId);
    }

    return await this.providerRepository.update(id, data);
  }
}

