import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../modules/messages/messages.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

const MAX_SOCKETS_PER_USER = 5;
const MAX_CONTENT_LENGTH = 2000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGE_RATE_LIMIT = 10;
const MESSAGE_RATE_WINDOW_MS = 10000;

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  },
  namespace: '/',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private userSockets = new Map<string, Set<string>>();
  private messageRateLimits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  private getUserId(client: Socket): string | undefined {
    return (client.data as Record<string, unknown>)?.userId as string | undefined;
  }

  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    const entry = this.messageRateLimits.get(userId);

    if (!entry || now > entry.resetAt) {
      this.messageRateLimits.set(userId, { count: 1, resetAt: now + MESSAGE_RATE_WINDOW_MS });
      return false;
    }

    entry.count++;
    return entry.count > MESSAGE_RATE_LIMIT;
  }

  handleConnection(client: Socket) {
    try {
      const token =
        ((client.handshake.auth as Record<string, unknown>)?.token as string | undefined) ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ sub: string }>(token);
      const userId = payload.sub;
      (client.data as Record<string, unknown>).userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }

      const sockets = this.userSockets.get(userId)!;
      if (sockets.size >= MAX_SOCKETS_PER_USER) {
        client.emit('error', { message: 'Too many connections' });
        client.disconnect();
        return;
      }

      sockets.add(client.id);
      void client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected (socket: ${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserId(client);
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId || !data?.requestId || !UUID_REGEX.test(data.requestId)) return;

    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: data.requestId },
      select: { clientId: true, provider: { select: { userId: true } } },
    });

    if (!request) return;

    const isParticipant =
      request.clientId === userId ||
      request.provider?.userId === userId;

    if (!isParticipant) {
      client.emit('error', { message: 'Not authorized to join this conversation' });
      return;
    }

    void client.join(`conversation:${data.requestId}`);
    this.logger.log(`Socket ${client.id} joined conversation:${data.requestId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    if (!data?.requestId) return;
    void client.leave(`conversation:${data.requestId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string; content: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;

    if (!data?.requestId || !UUID_REGEX.test(data.requestId)) {
      client.emit('messageError', { error: 'Invalid request ID' });
      return;
    }

    if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
      client.emit('messageError', { error: 'Message content is required' });
      return;
    }

    if (data.content.length > MAX_CONTENT_LENGTH) {
      client.emit('messageError', { error: `Message must be under ${MAX_CONTENT_LENGTH} characters` });
      return;
    }

    if (this.isRateLimited(userId)) {
      client.emit('messageError', { error: 'Too many messages. Please slow down.' });
      return;
    }

    try {
      const message = await this.messagesService.sendMessage(
        userId,
        data.requestId,
        data.content.trim(),
      );
      this.server.to(`conversation:${data.requestId}`).emit('newMessage', message);
      return message;
    } catch {
      client.emit('messageError', { error: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId || !data?.requestId) return;

    client.to(`conversation:${data.requestId}`).emit('userTyping', {
      requestId: data.requestId,
      userId,
    });
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitNotification(userId: string, notification: unknown) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  emitToConversation(requestId: string, event: string, payload: unknown) {
    this.server.to(`conversation:${requestId}`).emit(event, payload);
  }
}
