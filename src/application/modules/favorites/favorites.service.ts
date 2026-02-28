import { Injectable, Inject } from '@nestjs/common';
import type { IFavoriteRepository } from '../../../core/repositories/favorite.repository.interface';
import { FavoriteEntity } from '../../../core/entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject('IFavoriteRepository')
    private readonly favoriteRepository: IFavoriteRepository,
  ) {}

  async toggle(userId: string, providerId: string): Promise<{ favorited: boolean }> {
    return this.favoriteRepository.toggle(userId, providerId);
  }

  async getUserFavorites(userId: string): Promise<FavoriteEntity[]> {
    return this.favoriteRepository.findByUser(userId);
  }

  async isFavorited(userId: string, providerId: string): Promise<boolean> {
    return this.favoriteRepository.isFavorited(userId, providerId);
  }
}

