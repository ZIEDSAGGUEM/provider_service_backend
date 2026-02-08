import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../../../infrastructure/services/supabase.service';
import { GetUserUseCase } from '../../../../core/use-cases/auth/get-user.usecase';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Validate token with Supabase
      const supabaseUser = await this.supabaseService.validateToken(token);

      // Get user from our database
      const user = await this.getUserUseCase.execute(supabaseUser.id);

      // Attach user to request
      request.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

