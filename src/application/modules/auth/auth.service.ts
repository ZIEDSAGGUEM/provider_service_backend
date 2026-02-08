import { Injectable } from '@nestjs/common';
import { GetUserUseCase } from '../../../core/use-cases/auth/get-user.usecase';
import { SyncUserUseCase } from '../../../core/use-cases/auth/sync-user.usecase';
import { UserEntity, UserRole } from '../../../core/entities/user.entity';
import { SupabaseService } from '../../../infrastructure/services/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly syncUserUseCase: SyncUserUseCase,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getCurrentUser(userId: string): Promise<UserEntity> {
    return await this.getUserUseCase.execute(userId);
  }

  async completeProfile(userId: string, role: UserRole): Promise<UserEntity> {
    // Get user from Supabase to get email
    const supabaseUser = await this.supabaseService.getUserById(userId);

    if (!supabaseUser.email) {
      throw new Error('User email not found');
    }

    // Update user in our database
    return await this.syncUserUseCase.execute({
      id: userId,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      role,
      avatar: supabaseUser.user_metadata?.avatar_url,
      verified: !!supabaseUser.email_confirmed_at,
    });
  }
}

