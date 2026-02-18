export class ReviewEntity {
  id: string;
  requestId: string;
  clientId: string;
  providerId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (populated by repository)
  client?: {
    id: string;
    name: string;
    avatar?: string | null;
  };

  constructor(partial: Partial<ReviewEntity>) {
    Object.assign(this, partial);
  }
}

