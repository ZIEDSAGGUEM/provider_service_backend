import { IsArray, IsString, IsNotEmpty, ValidateNested, IsIn, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class ChatMessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

export class AiChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}

export class AiChatResponseDto {
  message: string;
  providers: any[]; // Will contain full provider data for recommended ones

  constructor(message: string, providers: any[]) {
    this.message = message;
    this.providers = providers;
  }
}

