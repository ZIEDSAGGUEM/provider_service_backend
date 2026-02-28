import { FavoriteEntity } from '../entities/favorite.entity';

export interface IFavoriteRepository {
  toggle(userId: string, providerId: string): Promise<{ favorited: boolean }>;
  findByUser(userId: string): Promise<FavoriteEntity[]>;
  isFavorited(userId: string, providerId: string): Promise<boolean>;
  count(providerId: string): Promise<number>;
}

