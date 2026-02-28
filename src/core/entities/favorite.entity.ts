export class FavoriteEntity {
  id: string;
  userId: string;
  providerId: string;
  createdAt: Date;
  provider?: any;

  constructor(props: Partial<FavoriteEntity>) {
    Object.assign(this, props);
  }
}

