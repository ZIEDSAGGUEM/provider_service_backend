import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaFavoriteRepository } from '../../../infrastructure/database/repositories/prisma-favorite.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PassportModule, AuthModule],
  controllers: [FavoritesController],
  providers: [
    FavoritesService,
    PrismaService,
    { provide: 'IFavoriteRepository', useClass: PrismaFavoriteRepository },
  ],
})
export class FavoritesModule {}

