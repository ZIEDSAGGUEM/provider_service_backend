import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { ProviderEntity } from '../../entities/provider.entity';

@Injectable()
export class GetProviderUseCase {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(id: string): Promise<ProviderEntity> {
    const provider = await this.providerRepository.findById(id);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return provider;
  }
}

