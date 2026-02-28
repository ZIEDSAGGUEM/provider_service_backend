import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
      throw new NotFoundException('Provider not found');
    }

    if (provider.userId !== userId) {
      throw new ForbiddenException('You can only delete your own provider profile');
    }

    await this.providerRepository.delete(id);
    await this.categoryRepository.decrementProviderCount(provider.categoryId);
  }
}
