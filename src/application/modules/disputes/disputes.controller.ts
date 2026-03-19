import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserEntity } from '../../../core/entities/user.entity';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { RespondDisputeDto } from './dto/respond-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputesService.create(user.id, dto);
  }

  @Get('my')
  @Roles(UserRole.CLIENT)
  async getClientDisputes(@CurrentUser() user: UserEntity) {
    return this.disputesService.getClientDisputes(user.id);
  }

  @Get('provider')
  @Roles(UserRole.PROVIDER)
  async getProviderDisputes(@CurrentUser() user: UserEntity) {
    return this.disputesService.getProviderDisputes(user.id);
  }

  @Put(':id/respond')
  @Roles(UserRole.PROVIDER)
  async providerRespond(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RespondDisputeDto,
  ) {
    return this.disputesService.providerRespond(user.id, id, dto);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  async getAllDisputes(@Query('status') status?: string) {
    return this.disputesService.getAllDisputes(status);
  }

  @Put(':id/resolve')
  @Roles(UserRole.ADMIN)
  async resolve(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolve(user.id, id, dto);
  }
}
