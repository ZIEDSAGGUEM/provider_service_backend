import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AiAppService } from './ai.service';
import { AiChatRequestDto, AiChatResponseDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../../core/entities/user.entity';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiAppService: AiAppService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @CurrentUser() user: UserEntity,
    @Body() dto: AiChatRequestDto,
  ): Promise<AiChatResponseDto> {
    this.logger.log(
      `User ${user.id} sending AI chat — ${dto.messages.length} messages`,
    );
    return this.aiAppService.chat(dto.messages);
  }
}

