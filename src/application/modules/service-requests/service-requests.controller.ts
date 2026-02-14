import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CancelServiceRequestDto } from './dto/cancel-service-request.dto';
import { DeclineServiceRequestDto } from './dto/decline-service-request.dto';
import { ServiceRequestResponseDto } from './dto/service-request-response.dto';
import { JwtAuthGuard } from '../../../application/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../application/common/guards/roles.guard';
import { Roles } from '../../../application/common/decorators/roles.decorator';
import { CurrentUser } from '../../../application/common/decorators/current-user.decorator';
import { UserRole } from '../../../core/entities/user.entity';
import { UserEntity } from '../../../core/entities/user.entity';
import { RequestStatus } from '../../../core/entities/service-request.entity';

@Controller('service-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceRequestsController {
  private readonly logger = new Logger(ServiceRequestsController.name);

  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Post()
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateServiceRequestDto,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Creating service request by client: ${user.id}`);
    const request = await this.serviceRequestsService.createRequest(user.id, dto);
    return new ServiceRequestResponseDto(request);
  }

  @Get('my-requests')
  @Roles(UserRole.CLIENT)
  async getMyRequests(
    @CurrentUser() user: UserEntity,
    @Query('status') status?: RequestStatus,
  ): Promise<ServiceRequestResponseDto[]> {
    this.logger.log(`Fetching requests for client: ${user.id}`);
    const requests = await this.serviceRequestsService.getMyRequests(user.id, status);
    return requests.map((req) => new ServiceRequestResponseDto(req));
  }

  @Get('provider-requests')
  @Roles(UserRole.PROVIDER)
  async getProviderRequests(
    @CurrentUser() user: UserEntity,
    @Query('status') status?: RequestStatus,
  ): Promise<ServiceRequestResponseDto[]> {
    this.logger.log(`Fetching requests for provider: ${user.id}`);
    const requests = await this.serviceRequestsService.getProviderRequests(user.id, status);
    return requests.map((req) => new ServiceRequestResponseDto(req));
  }

  @Get(':id')
  @Roles(UserRole.CLIENT, UserRole.PROVIDER)
  async getRequestById(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Fetching service request ${id} by user: ${user.id}`);
    const request = await this.serviceRequestsService.getRequestById(id, user.id);
    return new ServiceRequestResponseDto(request);
  }

  @Put(':id/cancel')
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  async cancelRequest(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() dto: CancelServiceRequestDto,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Cancelling service request ${id} by client: ${user.id}`);
    const request = await this.serviceRequestsService.cancelRequest(id, user.id, dto.reason);
    return new ServiceRequestResponseDto(request);
  }

  @Put(':id/accept')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async acceptRequest(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Provider ${user.id} accepting service request ${id}`);
    const request = await this.serviceRequestsService.acceptRequest(id, user.id);
    return new ServiceRequestResponseDto(request);
  }

  @Put(':id/decline')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async declineRequest(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() dto: DeclineServiceRequestDto,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Provider ${user.id} declining service request ${id}`);
    const request = await this.serviceRequestsService.declineRequest(id, user.id, dto.reason);
    return new ServiceRequestResponseDto(request);
  }
}

