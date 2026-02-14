import { Inject, Injectable } from '@nestjs/common';
import type { IProviderRepository } from '../../repositories/provider.repository.interface';
import { ProviderEntity } from '../../entities/provider.entity';

@Injectable()
export class GetMyProviderUseCase {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(userId: string): Promise<ProviderEntity> {
    const provider = await this.providerRepository.findByUserId(userId);
    
    if (!provider) {
      throw new Error('Provider profile not found. Please create a profile first.');
    }

    return provider;
  }
}

