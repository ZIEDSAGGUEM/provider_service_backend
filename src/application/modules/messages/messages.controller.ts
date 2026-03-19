import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import {
  MessageResponseDto,
  ConversationSummaryDto,
} from './dto/message-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../../core/entities/user.entity';
import { EventsGateway } from '../../gateways/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Send a message within a service request conversation
   * POST /api/messages
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() user: UserEntity,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    this.logger.log(
      `User ${user.id} sending message to request ${dto.requestId}`,
    );
    const message = await this.messagesService.sendMessage(
      user.id,
      dto.requestId,
      dto.content,
    );
    const responseDto = new MessageResponseDto(message);

    this.eventsGateway.emitToConversation(
      dto.requestId,
      'newMessage',
      responseDto,
    );

    // Send notification to the other participant
    try {
      const request = await this.prisma.serviceRequest.findUnique({
        where: { id: dto.requestId },
        select: {
          clientId: true,
          title: true,
          provider: { select: { userId: true } },
        },
      });

      if (request) {
        const recipientId =
          request.clientId === user.id
            ? request.provider?.userId
            : request.clientId;

        if (recipientId) {
          const preview =
            dto.content.length > 60
              ? dto.content.substring(0, 60) + '...'
              : dto.content;

          const notification = await this.notificationsService.create({
            userId: recipientId,
            type: 'NEW_MESSAGE',
            title: `New message from ${user.name}`,
            body: preview,
            data: { requestId: dto.requestId },
          });

          this.eventsGateway.emitNotification(recipientId, notification);
        }
      }
    } catch (err) {
      this.logger.warn('Failed to send message notification', err);
    }

    return responseDto;
  }

  /**
   * Get all conversations for the current user
   * GET /api/messages/conversations
   */
  @Get('conversations')
  async getConversations(
    @CurrentUser() user: UserEntity,
  ): Promise<ConversationSummaryDto[]> {
    this.logger.log(`Fetching conversations for user ${user.id}`);
    const conversations = await this.messagesService.getConversations(user.id);
    return conversations.map((c) => new ConversationSummaryDto(c));
  }

  /**
   * Get unread message count for current user
   * GET /api/messages/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser() user: UserEntity,
  ): Promise<{ count: number }> {
    return this.messagesService.getUnreadCount(user.id);
  }

  /**
   * Get all messages for a specific service request
   * GET /api/messages/request/:requestId
   */
  @Get('request/:requestId')
  async getConversation(
    @CurrentUser() user: UserEntity,
    @Param('requestId', ParseUUIDPipe) requestId: string,
  ): Promise<MessageResponseDto[]> {
    this.logger.log(
      `Fetching conversation for request ${requestId}, user ${user.id}`,
    );
    const messages = await this.messagesService.getConversation(
      requestId,
      user.id,
    );
    return messages.map((m) => new MessageResponseDto(m));
  }
}
