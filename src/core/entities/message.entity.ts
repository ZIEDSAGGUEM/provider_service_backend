export class MessageEntity {
  id: string;
  senderId: string;
  requestId: string;
  content: string;
  read: boolean;
  createdAt: Date;

  // Populated via joins
  sender?: {
    id: string;
    name: string;
    avatar: string | null;
  };

  request?: {
    id: string;
    title: string;
    clientId: string;
    providerId: string;
    providerUserId?: string;
    otherParty?: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };

  constructor(data: Partial<MessageEntity>) {
    Object.assign(this, data);
  }
}

