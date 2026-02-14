import { Inject, Injectable } from '@nestjs/common';
import type { IProviderRepository, ProviderSearchFilters } from '../../repositories/provider.repository.interface';
import { ProviderEntity } from '../../entities/provider.entity';

@Injectable()
export class SearchProvidersUseCase {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(filters?: ProviderSearchFilters): Promise<ProviderEntity[]> {
    return await this.providerRepository.findAll(filters);
  }
}

