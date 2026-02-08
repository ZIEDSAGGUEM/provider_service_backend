import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { SupabaseService } from '../../../infrastructure/services/supabase.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaUserRepository } from '../../../infrastructure/database/repositories/prisma-user.repository';
import { GetUserUseCase } from '../../../core/use-cases/auth/get-user.usecase';
import { SyncUserUseCase } from '../../../core/use-cases/auth/sync-user.usecase';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseService,
    PrismaService,
    PrismaUserRepository,
    SupabaseAuthGuard,
    // Repository
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    // Use Cases
    GetUserUseCase,
    SyncUserUseCase,
  ],
  exports: [AuthService, SupabaseAuthGuard, GetUserUseCase],
})
export class AuthModule {}

