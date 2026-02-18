import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../../core/entities/user.entity';
import { UserEntity } from '../../../core/entities/user.entity';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);

  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    this.logger.log(`Client ${user.id} creating review for request ${dto.requestId}`);
    const review = await this.reviewsService.createReview(user.id, dto);
    return new ReviewResponseDto(review);
  }

  @Get('provider/:providerId')
  async getProviderReviews(
    @Param('providerId') providerId: string,
  ): Promise<ReviewResponseDto[]> {
    this.logger.log(`Fetching reviews for provider ${providerId}`);
    const reviews = await this.reviewsService.getProviderReviews(providerId);
    return reviews.map((review) => new ReviewResponseDto(review));
  }
}

