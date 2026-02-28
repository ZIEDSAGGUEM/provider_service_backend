import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
      throw new NotFoundException('Provider not found');
    }

    if (provider.userId !== userId) {
      throw new ForbiddenException('You can only update your own provider profile');
    }

    if (data.categoryId && data.categoryId !== provider.categoryId) {
      const newCategory = await this.categoryRepository.findById(data.categoryId);
      if (!newCategory) {
        throw new NotFoundException('Category not found');
      }
      await this.categoryRepository.decrementProviderCount(provider.categoryId);
      await this.categoryRepository.incrementProviderCount(data.categoryId);
    }

    return this.providerRepository.update(id, data);
  }
}
