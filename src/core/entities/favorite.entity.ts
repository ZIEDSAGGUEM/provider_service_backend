export class FavoriteEntity {
  id: string;
  userId: string;
  providerId: string;
  createdAt: Date;
  provider?: Record<string, unknown>;

  constructor(props: Partial<FavoriteEntity>) {
    Object.assign(this, props);
  }
}
