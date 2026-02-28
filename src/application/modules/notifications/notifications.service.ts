import { Injectable, Inject } from '@nestjs/common';
import type { INotificationRepository, CreateNotificationDto } from '../../../core/repositories/notification.repository.interface';
import { NotificationEntity } from '../../../core/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async create(data: CreateNotificationDto): Promise<NotificationEntity> {
    return this.notificationRepository.create(data);
  }

  async getUserNotifications(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.findByUser(userId);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    return this.notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }
}

