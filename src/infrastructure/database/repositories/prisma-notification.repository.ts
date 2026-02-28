import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { INotificationRepository, CreateNotificationDto } from '../../../core/repositories/notification.repository.interface';
import { NotificationEntity } from '../../../core/entities/notification.entity';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationDto): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        body: data.body,
        data: data.data ?? undefined,
      },
    });
    return new NotificationEntity(notification as any);
  }

  async findByUser(userId: string, limit = 50): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications.map((n) => new NotificationEntity(n as any));
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }
}

