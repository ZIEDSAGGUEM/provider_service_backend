import { Injectable } from '@nestjs/common';
import { CreateProviderUseCase } from '../../../core/use-cases/provider/create-provider.usecase';
import { GetProviderUseCase } from '../../../core/use-cases/provider/get-provider.usecase';
import { GetMyProviderUseCase } from '../../../core/use-cases/provider/get-my-provider.usecase';
import { UpdateProviderUseCase } from '../../../core/use-cases/provider/update-provider.usecase';
import { SearchProvidersUseCase } from '../../../core/use-cases/provider/search-providers.usecase';
import { DeleteProviderUseCase } from '../../../core/use-cases/provider/delete-provider.usecase';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';
import type { CreateProviderDto as CreateProviderUseCaseDto } from '../../../core/repositories/provider.repository.interface';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly createProviderUseCase: CreateProviderUseCase,
    private readonly getProviderUseCase: GetProviderUseCase,
    private readonly getMyProviderUseCase: GetMyProviderUseCase,
    private readonly updateProviderUseCase: UpdateProviderUseCase,
    private readonly searchProvidersUseCase: SearchProvidersUseCase,
    private readonly deleteProviderUseCase: DeleteProviderUseCase,
  ) {}

  async createProvider(userId: string, dto: CreateProviderDto): Promise<ProviderResponseDto> {
    const data: CreateProviderUseCaseDto = {
      userId,
      categoryId: dto.categoryId,
      bio: dto.bio,
      hourlyRate: dto.hourlyRate,
      skills: dto.skills,
      availability: dto.availability,
      availabilitySchedule: dto.availabilitySchedule,
      yearsExperience: dto.yearsExperience,
      serviceRadius: dto.serviceRadius,
      portfolio: dto.portfolio,
      certifications: dto.certifications,
    };

    const provider = await this.createProviderUseCase.execute(data);
    return new ProviderResponseDto(provider);
  }

  async getProvider(id: string): Promise<ProviderResponseDto> {
    const provider = await this.getProviderUseCase.execute(id);
    return new ProviderResponseDto(provider);
  }

  async getMyProvider(userId: string): Promise<ProviderResponseDto> {
    const provider = await this.getMyProviderUseCase.execute(userId);
    return new ProviderResponseDto(provider);
  }

  async searchProviders(dto: SearchProvidersDto): Promise<ProviderResponseDto[]> {
    const providers = await this.searchProvidersUseCase.execute({
      q: dto.q,
      categoryId: dto.categoryId,
      minRating: dto.minRating,
      maxHourlyRate: dto.maxHourlyRate,
      skills: dto.skills,
      availability: dto.availability,
      status: dto.status,
      verified: dto.verified,
      location: dto.location,
      serviceRadius: dto.serviceRadius,
    });

    return providers.map((provider) => new ProviderResponseDto(provider));
  }

  async updateProvider(id: string, userId: string, dto: UpdateProviderDto): Promise<ProviderResponseDto> {
    const provider = await this.updateProviderUseCase.execute(id, userId, {
      categoryId: dto.categoryId,
      bio: dto.bio,
      hourlyRate: dto.hourlyRate,
      skills: dto.skills,
      availability: dto.availability,
      availabilitySchedule: dto.availabilitySchedule,
      yearsExperience: dto.yearsExperience,
      responseTime: dto.responseTime,
      serviceRadius: dto.serviceRadius,
      portfolio: dto.portfolio,
      certifications: dto.certifications,
    });

    return new ProviderResponseDto(provider);
  }

  async deleteProvider(id: string, userId: string): Promise<void> {
    await this.deleteProviderUseCase.execute(id, userId);
  }
}

