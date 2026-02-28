import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../../core/entities/user.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':providerId')
  @HttpCode(HttpStatus.OK)
  async toggle(
    @CurrentUser() user: UserEntity,
    @Param('providerId') providerId: string,
  ) {
    return this.favoritesService.toggle(user.id, providerId);
  }

  @Get()
  async getMyFavorites(@CurrentUser() user: UserEntity) {
    return this.favoritesService.getUserFavorites(user.id);
  }

  @Get('check/:providerId')
  async checkFavorite(
    @CurrentUser() user: UserEntity,
    @Param('providerId') providerId: string,
  ) {
    const favorited = await this.favoritesService.isFavorited(user.id, providerId);
    return { favorited };
  }
}

