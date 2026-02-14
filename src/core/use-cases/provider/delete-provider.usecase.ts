import { Inject, Injectable } from '@nestjs/common';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import type { ICategoryRepository } from '../../repositories/category.repository.interface';

@Injectable()
export class DeleteProviderUseCase {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const provider = await this.providerRepository.findById(id);
    
    if (!provider) {
      throw new Error('Provider not found');
    }

    // Ensure the provider belongs to the user
    if (provider.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own provider profile');
    }

    // Delete provider
    await this.providerRepository.delete(id);

    // Decrement category provider count
    await this.categoryRepository.decrementProviderCount(provider.categoryId);
  }
}

