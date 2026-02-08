import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhooksService } from './webhooks.service';
import { SupabaseWebhookDto } from './dto/supabase-webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {}

  @Post('supabase')
  async handleSupabaseWebhook(
    @Body() payload: SupabaseWebhookDto,
    @Headers('x-webhook-secret') webhookSecret: string,
  ) {
    this.logger.log('Received Supabase webhook');

    // Verify webhook secret
    const expectedSecret = this.configService.get<string>(
      'SUPABASE_WEBHOOK_SECRET',
    );

    if (webhookSecret !== expectedSecret) {
      this.logger.error('Invalid webhook secret');
      throw new UnauthorizedException('Invalid webhook secret');
    }

    try {
      return await this.webhooksService.handleSupabaseWebhook(payload);
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
      throw error;
    }
  }
}

