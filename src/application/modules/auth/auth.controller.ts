import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../../core/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /api/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    console.log('📝 Register request received:', { email: dto.email, name: dto.name, role: dto.role });
    try {
      const result = await this.authService.register(dto);
      console.log('✅ Registration successful');
      return result;
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      throw error;
    }
  }

  /**
   * Verify email with token
   * POST /api/auth/verify-email
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    console.log('📧 Verify email request received:', { token: dto.token });
    try {
      const result = await this.authService.verifyEmail(dto.token);
      console.log('✅ Email verification successful');
      return result;
    } catch (error) {
      console.error('❌ Email verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto): Promise<{ message: string }> {
    return await this.authService.resendVerificationEmail(dto.email);
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    console.log('🔐 Login request received:', { email: dto.email });
    try {
      const result = await this.authService.login(dto);
      console.log('✅ Login successful:', result.user.id);
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  /**
   * Request password reset
   * POST /api/auth/request-password-reset
   */
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto): Promise<{ message: string }> {
    return await this.authService.requestPasswordReset(dto.email);
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return await this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
