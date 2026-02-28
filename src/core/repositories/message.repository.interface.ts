import type { MessageEntity } from '../entities/message.entity';

export interface CreateMessageData {
  senderId: string;
  requestId: string;
  content: string;
}

export interface ConversationSummary {
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
}

export interface IMessageRepository {
  send(data: CreateMessageData): Promise<MessageEntity>;
  getByRequestId(requestId: string): Promise<MessageEntity[]>;
  getConversations(userId: string): Promise<ConversationSummary[]>;
  markAsRead(requestId: string, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

