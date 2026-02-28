import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
    const existingProvider = await this.providerRepository.findByUserId(data.userId);
    if (existingProvider) {
      throw new BadRequestException('Provider profile already exists for this user');
    }

    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const provider = await this.providerRepository.create(data);
    await this.categoryRepository.incrementProviderCount(data.categoryId);

    return provider;
  }
}
