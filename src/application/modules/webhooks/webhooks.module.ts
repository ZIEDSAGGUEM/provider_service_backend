import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaUserRepository } from '../../../infrastructure/database/repositories/prisma-user.repository';
import { SyncUserUseCase } from '../../../core/use-cases/auth/sync-user.usecase';
import { UpdateVerificationUseCase } from '../../../core/use-cases/auth/update-verification.usecase';

@Module({
  imports: [ConfigModule],
  controllers: [WebhooksController],
  providers: [
    WebhooksService,
    PrismaService,
    PrismaUserRepository,
    // Repository
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    // Use Cases
    SyncUserUseCase,
    UpdateVerificationUseCase,
  ],
})
export class WebhooksModule {}

