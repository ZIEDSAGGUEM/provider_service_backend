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
  Request,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  /**
   * Create provider profile (PROVIDER only)
   * POST /api/providers
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createProvider(
    @Request() req,
    @Body() dto: CreateProviderDto,
  ): Promise<ProviderResponseDto> {
    console.log('📝 Create provider request:', { userId: req.user.id, role: req.user.role });

    // Only PROVIDER role can create provider profile
    if (req.user.role !== 'PROVIDER') {
      throw new UnauthorizedException('Only users with PROVIDER role can create a provider profile');
    }

    try {
      const provider = await this.providersService.createProvider(req.user.id, dto);
      console.log('✅ Provider created successfully:', provider.id);
      return provider;
    } catch (error) {
      console.error('❌ Create provider error:', error.message);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get my provider profile (PROVIDER only)
   * GET /api/providers/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProvider(@Request() req): Promise<ProviderResponseDto> {
    console.log('📋 Get my provider request:', { userId: req.user.id });

    if (req.user.role !== 'PROVIDER') {
      throw new UnauthorizedException('Only PROVIDER users can access this endpoint');
    }

    try {
      return await this.providersService.getMyProvider(req.user.id);
    } catch (error) {
      console.error('❌ Get my provider error:', error.message);
      throw new NotFoundException(error.message);
    }
  }

  /**
   * Search providers (Public)
   * GET /api/providers?categoryId=xxx&minRating=4&...
   */
  @Get()
  async searchProviders(@Query() dto: SearchProvidersDto): Promise<ProviderResponseDto[]> {
    console.log('🔍 Search providers request:', dto);

    try {
      const providers = await this.providersService.searchProviders(dto);
      console.log(`✅ Found ${providers.length} providers`);
      return providers;
    } catch (error) {
      console.error('❌ Search providers error:', error.message);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get provider by ID (Public)
   * GET /api/providers/:id
   */
  @Get(':id')
  async getProvider(@Param('id') id: string): Promise<ProviderResponseDto> {
    console.log('📋 Get provider request:', { id });

    try {
      return await this.providersService.getProvider(id);
    } catch (error) {
      console.error('❌ Get provider error:', error.message);
      throw new NotFoundException(error.message);
    }
  }

  /**
   * Update provider profile (PROVIDER only, own profile)
   * PUT /api/providers/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateProvider(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateProviderDto,
  ): Promise<ProviderResponseDto> {
    console.log('✏️ Update provider request:', { id, userId: req.user.id });

    if (req.user.role !== 'PROVIDER') {
      throw new UnauthorizedException('Only PROVIDER users can update provider profiles');
    }

    try {
      return await this.providersService.updateProvider(id, req.user.id, dto);
    } catch (error) {
      console.error('❌ Update provider error:', error.message);
      if (error.message.includes('Unauthorized')) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Delete provider profile (PROVIDER only, own profile)
   * DELETE /api/providers/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProvider(@Param('id') id: string, @Request() req): Promise<void> {
    console.log('🗑️ Delete provider request:', { id, userId: req.user.id });

    if (req.user.role !== 'PROVIDER') {
      throw new UnauthorizedException('Only PROVIDER users can delete provider profiles');
    }

    try {
      await this.providersService.deleteProvider(id, req.user.id);
      console.log('✅ Provider deleted successfully');
    } catch (error) {
      console.error('❌ Delete provider error:', error.message);
      if (error.message.includes('Unauthorized')) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}

