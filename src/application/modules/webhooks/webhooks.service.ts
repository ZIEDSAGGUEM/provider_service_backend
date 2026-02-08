import { Injectable, Logger } from '@nestjs/common';
import { SyncUserUseCase } from '../../../core/use-cases/auth/sync-user.usecase';
import { UpdateVerificationUseCase } from '../../../core/use-cases/auth/update-verification.usecase';
import { UserRole } from '../../../core/entities/user.entity';
import { SupabaseWebhookDto } from './dto/supabase-webhook.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly syncUserUseCase: SyncUserUseCase,
    private readonly updateVerificationUseCase: UpdateVerificationUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async handleSupabaseWebhook(payload: SupabaseWebhookDto): Promise<any> {
    this.logger.log(`Received webhook: ${payload.type} on table ${payload.table}`);

    const { type, record } = payload;

    switch (type) {
      case 'INSERT':
        return await this.handleUserCreated(record);

      case 'UPDATE':
        return await this.handleUserUpdated(record);

      default:
        this.logger.warn(`Unhandled webhook type: ${type}`);
        return { message: 'Webhook received but not processed' };
    }
  }

  private async handleUserCreated(record: any): Promise<any> {
    const { id, email, user_metadata, email_confirmed_at } = record;

    this.logger.log(`Creating user: ${email}`);

    // Extract user metadata
    const fullName = user_metadata?.full_name || email.split('@')[0];
    const role = user_metadata?.role?.toUpperCase() || UserRole.CLIENT;
    const avatarUrl = user_metadata?.avatar_url;
    const verified = !!email_confirmed_at;

    // Sync user to our database
    const user = await this.syncUserUseCase.execute({
      id,
      email,
      name: fullName,
      role: role as UserRole,
      avatar: avatarUrl,
      verified,
    });

    // If user is a provider, create provider record
    if (user.role === UserRole.PROVIDER) {
      await this.createProviderRecord(user.id);
    }

    this.logger.log(`User created successfully: ${user.email}`);

    return { success: true, user };
  }

  private async handleUserUpdated(record: any): Promise<any> {
    const { id, email_confirmed_at, user_metadata } = record;

    this.logger.log(`Updating user: ${id}`);

    const verified = !!email_confirmed_at;

    // Update verification status
    const user = await this.updateVerificationUseCase.execute(id, verified);

    // If role was updated in metadata, update it
    if (user_metadata?.role) {
      await this.syncUserUseCase.execute({
        id,
        email: user.email,
        name: user.name,
        role: user_metadata.role.toUpperCase() as UserRole,
        verified,
      });

      // If changed to provider, create provider record
      if (user_metadata.role.toUpperCase() === UserRole.PROVIDER) {
        await this.createProviderRecord(id);
      }
    }

    this.logger.log(`User updated successfully: ${user.email}`);

    return { success: true, user };
  }

  private async createProviderRecord(userId: string): Promise<void> {
    // Check if provider record already exists
    const existingProvider = await this.prisma.provider.findUnique({
      where: { userId },
    });

    if (existingProvider) {
      this.logger.log(`Provider record already exists for user: ${userId}`);
      return;
    }

    // Get first category as default
    const firstCategory = await this.prisma.category.findFirst();

    if (!firstCategory) {
      this.logger.warn('No categories found. Cannot create provider record.');
      return;
    }

    // Create provider record
    await this.prisma.provider.create({
      data: {
        userId,
        categoryId: firstCategory.id,
        hourlyRate: 0,
        skills: [],
        bio: '',
      },
    });

    this.logger.log(`Provider record created for user: ${userId}`);
  }
}

