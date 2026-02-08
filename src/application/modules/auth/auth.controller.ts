import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../../core/entities/user.entity';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get current authenticated user
   * Protected route - requires valid Supabase JWT
   */
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getCurrentUser(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  /**
   * Complete user profile (for OAuth users without role)
   * Protected route - requires valid Supabase JWT
   */
  @Patch('complete-profile')
  @UseGuards(SupabaseAuthGuard)
  async completeProfile(
    @CurrentUser() user: UserEntity,
    @Body() dto: CompleteProfileDto,
  ): Promise<UserEntity> {
    return await this.authService.completeProfile(user.id, dto.role);
  }
}

