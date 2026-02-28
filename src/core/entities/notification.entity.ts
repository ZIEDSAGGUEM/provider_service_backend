export type NotificationType =
  | 'REQUEST_NEW'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_DECLINED'
  | 'REQUEST_STARTED'
  | 'REQUEST_COMPLETED'
  | 'REQUEST_CANCELLED'
  | 'NEW_MESSAGE'
  | 'NEW_REVIEW';

export class NotificationEntity {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: Date;

  constructor(props: Partial<NotificationEntity>) {
    Object.assign(this, props);
  }
}

