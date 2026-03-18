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

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token =
        ((client.handshake.auth as Record<string, unknown>)?.token as
          | string
          | undefined) ||
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
      this.userSockets.get(userId)!.add(client.id);

      void client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected (socket: ${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client.data as Record<string, unknown>)?.userId as
      | string
      | undefined;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    void client.join(`conversation:${data.requestId}`);
    this.logger.log(
      `Socket ${client.id} joined conversation:${data.requestId}`,
    );
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    void client.leave(`conversation:${data.requestId}`);
  }

  // Handles real-time send: message is saved via MessagesService and broadcast
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string; content: string },
  ) {
    const userId = (client.data as Record<string, unknown>).userId as
      | string
      | undefined;
    if (!userId) return;

    try {
      const message = await this.messagesService.sendMessage(
        userId,
        data.requestId,
        data.content,
      );
      this.server
        .to(`conversation:${data.requestId}`)
        .emit('newMessage', message);
      return message;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      client.emit('messageError', { error: errMsg });
    }
  }

  // Handles broadcast of a REST-sent message to the conversation room
  // so the other party receives it in real-time.
  @SubscribeMessage('notifyNewMessage')
  handleNotifyNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string; message: unknown },
  ) {
    client
      .to(`conversation:${data.requestId}`)
      .emit('newMessage', data.message);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    client.to(`conversation:${data.requestId}`).emit('userTyping', {
      requestId: data.requestId,
      userId: (client.data as Record<string, unknown>).userId,
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
