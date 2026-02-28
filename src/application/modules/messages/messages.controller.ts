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
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageResponseDto, ConversationSummaryDto } from './dto/message-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../../core/entities/user.entity';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

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
    this.logger.log(`User ${user.id} sending message to request ${dto.requestId}`);
    const message = await this.messagesService.sendMessage(user.id, dto.requestId, dto.content);
    return new MessageResponseDto(message);
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
    @Param('requestId') requestId: string,
  ): Promise<MessageResponseDto[]> {
    this.logger.log(`Fetching conversation for request ${requestId}, user ${user.id}`);
    const messages = await this.messagesService.getConversation(requestId, user.id);
    return messages.map((m) => new MessageResponseDto(m));
  }
}

