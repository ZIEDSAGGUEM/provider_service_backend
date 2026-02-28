import { MessageEntity } from '../../../../core/entities/message.entity';
import type { ConversationSummary } from '../../../../core/repositories/message.repository.interface';

export class MessageResponseDto {
  id: string;
  senderId: string;
  requestId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    name: string;
    avatar: string | null;
  };

  constructor(message: MessageEntity) {
    this.id = message.id;
    this.senderId = message.senderId;
    this.requestId = message.requestId;
    this.content = message.content;
    this.read = message.read;
    this.createdAt = message.createdAt;
    this.sender = message.sender;
  }
}

export class ConversationSummaryDto {
  requestId: string;
  requestTitle: string;
  otherParty: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    senderId: string;
  } | null;
  unreadCount: number;

  constructor(conv: ConversationSummary) {
    this.requestId = conv.requestId;
    this.requestTitle = conv.requestTitle;
    this.otherParty = conv.otherParty;
    this.lastMessage = conv.lastMessage;
    this.unreadCount = conv.unreadCount;
  }
}

