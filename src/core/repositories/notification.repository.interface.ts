import { NotificationEntity, NotificationType } from '../entities/notification.entity';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}

export interface INotificationRepository {
  create(data: CreateNotificationDto): Promise<NotificationEntity>;
  findByUser(userId: string, limit?: number): Promise<NotificationEntity[]>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

