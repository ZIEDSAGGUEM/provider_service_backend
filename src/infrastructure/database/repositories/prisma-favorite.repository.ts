import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { IFavoriteRepository } from '../../../core/repositories/favorite.repository.interface';
import { FavoriteEntity } from '../../../core/entities/favorite.entity';

@Injectable()
export class PrismaFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, providerId: string): Promise<{ favorited: boolean }> {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_providerId: { userId, providerId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, providerId } });
    return { favorited: true };
  }

  async findByUser(userId: string): Promise<FavoriteEntity[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        provider: {
          include: {
            user: { select: { id: true, name: true, avatar: true, location: true } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => new FavoriteEntity(f as any));
  }

  async isFavorited(userId: string, providerId: string): Promise<boolean> {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_providerId: { userId, providerId } },
    });
    return !!fav;
  }

  async count(providerId: string): Promise<number> {
    return this.prisma.favorite.count({ where: { providerId } });
  }
}

