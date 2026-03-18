import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { UserEntity, UserRole } from '../../../core/entities/user.entity';
import { EmailService } from '../../../infrastructure/services/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class AuthService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const { email, password, name, role } = dto;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: role,
      verified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      email,
      name,
      verificationToken,
    );

    return {
      message:
        'Registration successful! Please check your email to verify your account.',
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.verified) {
      throw new BadRequestException('Email already verified');
    }

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Verification token expired');
    }

    // Mark user as verified and clear token
    await this.userRepository.update(user.id, {
      verified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });

    return {
      message: 'Email verified successfully! You can now login.',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.userRepository.update(user.id, {
      verificationToken,
      verificationTokenExpiry,
    });

    // Resend verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
    );

    return {
      message: 'Verification email sent! Please check your inbox.',
    };
  }

  /**
   * Login user with account lockout protection
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Account is locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: any = { failedLoginAttempts: attempts };

      if (attempts >= AuthService.MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + AuthService.LOCKOUT_DURATION_MS,
        );
        await this.userRepository.update(user.id, updateData);
        throw new ForbiddenException(
          'Account locked due to too many failed attempts. Try again in 15 minutes.',
        );
      }

      await this.userRepository.update(user.id, updateData);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.verified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    // Reset failed attempts on successful login
    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as UserEntity,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') + '-refresh',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      // Token reuse detected — invalidate all tokens
      await this.userRepository.update(user.id, { refreshToken: null });
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Rotate refresh token
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepository.update(user.id, {
      refreshToken: hashedNewRefreshToken,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as UserEntity,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword as UserEntity;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return {
        message:
          'If your email is registered, you will receive a password reset link.',
      };
    }

    // Generate password reset token
    const passwordResetToken = randomBytes(32).toString('hex');
    const passwordResetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken,
      passwordResetTokenExpiry,
    });

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      passwordResetToken,
    );

    return {
      message:
        'If your email is registered, you will receive a password reset link.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (
      user.passwordResetTokenExpiry &&
      user.passwordResetTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Reset token expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    });

    return {
      message:
        'Password reset successfully! You can now login with your new password.',
    };
  }

  /**
   * Update user profile (name, phone, location)
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.update(userId, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.location !== undefined && { location: dto.location }),
    });

    const { password: _, ...userWithoutPassword } = updated;
    return userWithoutPassword as UserEntity;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password!,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  /**
   * Get user settings
   */
  async getSettings(userId: string): Promise<Record<string, any>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const defaults = {
      emailNotifications: true,
      pushNotifications: true,
      messageNotifications: true,
      bookingNotifications: true,
      reviewNotifications: true,
      profileVisibility: true,
      showRatings: true,
      showAvailability: true,
    };

    const stored = (user as any).settings || {};
    return { ...defaults, ...stored };
  }

  /**
   * Update user settings
   */
  async updateSettings(
    userId: string,
    dto: UpdateSettingsDto,
  ): Promise<Record<string, any>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentSettings = (user as any).settings || {};
    const newSettings = { ...currentSettings };

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        newSettings[key] = value;
      }
    }

    await this.userRepository.update(userId, { settings: newSettings } as any);
    return newSettings;
  }

  /**
   * Delete user account
   */
  async deleteAccount(
    userId: string,
    password: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    await this.userRepository.delete(userId);
    return { message: 'Account deleted successfully' };
  }

  /**
   * Generate short-lived JWT access token
   */
  private generateAccessToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: AuthService.ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate long-lived JWT refresh token
   */
  private generateRefreshToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') + '-refresh',
      expiresIn: AuthService.REFRESH_TOKEN_EXPIRY,
    });
  }
}
