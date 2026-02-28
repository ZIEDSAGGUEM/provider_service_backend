import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AiController } from './ai.controller';
import { AiAppService } from './ai.service';
import { GroqAiService } from '../../../infrastructure/services/groq-ai.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaProviderRepository } from '../../../infrastructure/database/repositories/prisma-provider.repository';
import { PrismaCategoryRepository } from '../../../infrastructure/database/repositories/prisma-category.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PassportModule, AuthModule],
  controllers: [AiController],
  providers: [
    AiAppService,
    PrismaService,
    {
      provide: 'IAiService',
      useClass: GroqAiService,
    },
    {
      provide: 'IProviderRepository',
      useClass: PrismaProviderRepository,
    },
    {
      provide: 'ICategoryRepository',
      useClass: PrismaCategoryRepository,
    },
  ],
})
export class AiModule {}
