import {
  Controller, Get, Post, Put,
  Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserEntity } from '../../../core/entities/user.entity';
import { DisputesService } from './disputes.service';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  // ── Client ──

  @Post()
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: UserEntity,
    @Body() body: { requestId: string; reason: string; evidence?: string[] },
  ) {
    return this.disputesService.create(user.id, body);
  }

  @Get('my')
  @Roles(UserRole.CLIENT)
  async getClientDisputes(@CurrentUser() user: UserEntity) {
    return this.disputesService.getClientDisputes(user.id);
  }

  // ── Provider ──

  @Get('provider')
  @Roles(UserRole.PROVIDER)
  async getProviderDisputes(@CurrentUser() user: UserEntity) {
    return this.disputesService.getProviderDisputes(user.id);
  }

  @Put(':id/respond')
  @Roles(UserRole.PROVIDER)
  async providerRespond(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() body: { providerResponse: string; providerEvidence?: string[] },
  ) {
    return this.disputesService.providerRespond(user.id, id, body);
  }

  // ── Admin ──

  @Get('admin')
  @Roles(UserRole.ADMIN)
  async getAllDisputes(@Query('status') status?: string) {
    return this.disputesService.getAllDisputes(status);
  }

  @Put(':id/resolve')
  @Roles(UserRole.ADMIN)
  async resolve(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() body: { resolution: 'CLIENT_FAVORED' | 'PROVIDER_FAVORED' | 'COMPROMISE'; adminNote?: string },
  ) {
    return this.disputesService.resolve(user.id, id, body);
  }
}

