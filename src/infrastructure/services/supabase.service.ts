import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL') as string,
      this.configService.get('SUPABASE_SERVICE_KEY') as string,
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Validate JWT token and return Supabase user
   */
  async validateToken(token: string): Promise<User> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return data.user;
  }

  /**
   * Get user by ID (admin operation)
   */
  async getUserById(userId: string): Promise<User> {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);

    if (error || !data.user) {
      throw new UnauthorizedException('User not found in Supabase');
    }

    return data.user;
  }
}
