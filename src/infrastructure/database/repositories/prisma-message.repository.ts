import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IMessageRepository,
  CreateMessageData,
  ConversationSummary,
} from '../../../core/repositories/message.repository.interface';
import { MessageEntity } from '../../../core/entities/message.entity';

@Injectable()
export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(message: any): MessageEntity {
    return new MessageEntity({
      id: message.id,
      senderId: message.senderId,
      requestId: message.requestId,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt,
      sender: message.sender
        ? {
            id: message.sender.id,
            name: message.sender.name,
            avatar: message.sender.avatar,
          }
        : undefined,
      request: message.request
        ? {
            id: message.request.id,
            title: message.request.title,
            clientId: message.request.clientId,
            providerId: message.request.providerId,
          }
        : undefined,
    });
  }

  async send(data: CreateMessageData): Promise<MessageEntity> {
    const message = await this.prisma.message.create({
      data: {
        senderId: data.senderId,
        requestId: data.requestId,
        content: data.content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        request: {
          select: { id: true, title: true, clientId: true, providerId: true },
        },
      },
    });

    return this.mapToEntity(message);
  }

  async getByRequestId(requestId: string): Promise<MessageEntity[]> {
    const messages = await this.prisma.message.findMany({
      where: { requestId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => this.mapToEntity(m));
  }

  async getConversations(userId: string): Promise<ConversationSummary[]> {
    // Get all service requests where this user is either the client or the provider
    const requests = await this.prisma.serviceRequest.findMany({
      where: {
        OR: [
          { clientId: userId },
          { provider: { userId } },
        ],
        messages: { some: {} }, // Only requests that have at least one message
      },
      include: {
        client: { select: { id: true, name: true, avatar: true } },
        provider: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return requests.map((req) => {
      const isClient = req.clientId === userId;
      const otherParty = isClient
        ? {
            id: req.provider.user.id,
            name: req.provider.user.name,
            avatar: req.provider.user.avatar,
          }
        : {
            id: req.client.id,
            name: req.client.name,
            avatar: req.client.avatar,
          };

      const lastMsg = req.messages[0];

      return {
        requestId: req.id,
        requestTitle: req.title,
        otherParty,
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
              senderId: lastMsg.senderId,
            }
          : null,
        unreadCount: req._count.messages,
      };
    });
  }

  async markAsRead(requestId: string, userId: string): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        requestId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        read: false,
        senderId: { not: userId },
        request: {
          OR: [
            { clientId: userId },
            { provider: { userId } },
          ],
        },
      },
    });
  }
}

