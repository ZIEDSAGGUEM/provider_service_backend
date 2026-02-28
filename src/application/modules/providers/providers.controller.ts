import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserEntity } from '../../../core/entities/user.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';

@Controller('providers')
export class ProvidersController {
  private readonly logger = new Logger(ProvidersController.name);

  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  async createProvider(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateProviderDto,
  ): Promise<ProviderResponseDto> {
    this.logger.log(`Creating provider profile for user ${user.id}`);
    return this.providersService.createProvider(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  async getMyProvider(@CurrentUser() user: UserEntity): Promise<ProviderResponseDto> {
    return this.providersService.getMyProvider(user.id);
  }

  @Get('me/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  async getMyAnalytics(@CurrentUser() user: UserEntity) {
    return this.providersService.getAnalytics(user.id);
  }

  @Get()
  async searchProviders(@Query() dto: SearchProvidersDto): Promise<ProviderResponseDto[]> {
    return this.providersService.searchProviders(dto);
  }

  @Get(':id')
  async getProvider(@Param('id') id: string): Promise<ProviderResponseDto> {
    return this.providersService.getProvider(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  async updateProvider(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateProviderDto,
  ): Promise<ProviderResponseDto> {
    return this.providersService.updateProvider(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProvider(@Param('id') id: string, @CurrentUser() user: UserEntity): Promise<void> {
    await this.providersService.deleteProvider(id, user.id);
  }
}
