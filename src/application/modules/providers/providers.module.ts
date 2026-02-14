import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

// Use Cases
import { CreateProviderUseCase } from '../../../core/use-cases/provider/create-provider.usecase';
import { GetProviderUseCase } from '../../../core/use-cases/provider/get-provider.usecase';
import { GetMyProviderUseCase } from '../../../core/use-cases/provider/get-my-provider.usecase';
import { UpdateProviderUseCase } from '../../../core/use-cases/provider/update-provider.usecase';
import { SearchProvidersUseCase } from '../../../core/use-cases/provider/search-providers.usecase';
import { DeleteProviderUseCase } from '../../../core/use-cases/provider/delete-provider.usecase';

// Repositories
import { PrismaProviderRepository } from '../../../infrastructure/database/repositories/prisma-provider.repository';
import { PrismaCategoryRepository } from '../../../infrastructure/database/repositories/prisma-category.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Module({
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    PrismaService,
    
    // Use Cases
    CreateProviderUseCase,
    GetProviderUseCase,
    GetMyProviderUseCase,
    UpdateProviderUseCase,
    SearchProvidersUseCase,
    DeleteProviderUseCase,
    
    // Repositories
    {
      provide: 'IProviderRepository',
      useClass: PrismaProviderRepository,
    },
    {
      provide: 'ICategoryRepository',
      useClass: PrismaCategoryRepository,
    },
  ],
  exports: [ProvidersService],
})
export class ProvidersModule {}

