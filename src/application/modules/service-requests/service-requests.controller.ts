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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CancelServiceRequestDto } from './dto/cancel-service-request.dto';
import { DeclineServiceRequestDto } from './dto/decline-service-request.dto';
import { CompleteServiceRequestDto } from './dto/complete-service-request.dto';
import { ServiceRequestResponseDto } from './dto/service-request-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../../core/entities/user.entity';
import { UserEntity } from '../../../core/entities/user.entity';
import { RequestStatus } from '../../../core/entities/service-request.entity';
import { EventsGateway } from '../../gateways/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { NotificationType } from '../../../core/entities/notification.entity';

@Controller('service-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceRequestsController {
  private readonly logger = new Logger(ServiceRequestsController.name);

  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  private async notifyStatusChange(
    requestId: string,
    newStatus: string,
    actorName: string,
    recipientUserId: string,
    requestTitle: string,
  ) {
    const statusMessages: Record<string, { type: NotificationType; title: string; body: string }> = {
      ACCEPTED: {
        type: 'REQUEST_ACCEPTED',
        title: 'Request Accepted',
        body: `${actorName} accepted your request "${requestTitle}"`,
      },
      DECLINED: {
        type: 'REQUEST_DECLINED',
        title: 'Request Declined',
        body: `${actorName} declined your request "${requestTitle}"`,
      },
      IN_PROGRESS: {
        type: 'REQUEST_STARTED',
        title: 'Work Started',
        body: `${actorName} has started working on "${requestTitle}"`,
      },
      COMPLETED: {
        type: 'REQUEST_COMPLETED',
        title: 'Request Completed',
        body: `${actorName} has completed "${requestTitle}"`,
      },
      CANCELLED: {
        type: 'REQUEST_CANCELLED',
        title: 'Request Cancelled',
        body: `${actorName} cancelled the request "${requestTitle}"`,
      },
    };

    const msg = statusMessages[newStatus];
    if (!msg) return;

    try {
      const notification = await this.notificationsService.create({
        userId: recipientUserId,
        type: msg.type,
        title: msg.title,
        body: msg.body,
        data: { requestId },
      });

      this.eventsGateway.emitNotification(recipientUserId, notification);
      this.eventsGateway.emitToUser(recipientUserId, 'requestStatusUpdate', {
        requestId,
        status: newStatus,
      });
    } catch (err) {
      this.logger.warn('Failed to send status notification', err);
    }
  }

  private async getRecipientAndTitle(
    requestId: string,
    actorUserId: string,
  ): Promise<{ recipientUserId: string; title: string } | null> {
    const req = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: {
        clientId: true,
        title: true,
        provider: { select: { userId: true } },
      },
    });
    if (!req) return null;

    const recipientUserId =
      req.clientId === actorUserId
        ? req.provider?.userId
        : req.clientId;

    return recipientUserId ? { recipientUserId, title: req.title } : null;
  }

  @Post()
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateServiceRequestDto,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Creating service request by client: ${user.id}`);
    const request = await this.serviceRequestsService.createRequest(
      user.id,
      dto,
    );
    const responseDto = new ServiceRequestResponseDto(request);

    const info = await this.getRecipientAndTitle(request.id, user.id);
    if (info) {
      try {
        const notification = await this.notificationsService.create({
          userId: info.recipientUserId,
          type: 'REQUEST_NEW',
          title: 'New Service Request',
          body: `${user.name} sent you a request: "${info.title}"`,
          data: { requestId: request.id },
        });
        this.eventsGateway.emitNotification(info.recipientUserId, notification);
        this.eventsGateway.emitToUser(info.recipientUserId, 'requestStatusUpdate', {
          requestId: request.id,
          status: 'PENDING',
        });
      } catch (err) {
        this.logger.warn('Failed to send new request notification', err);
      }
    }

    return responseDto;
  }

  @Get('my-requests')
  @Roles(UserRole.CLIENT)
  async getMyRequests(
    @CurrentUser() user: UserEntity,
    @Query('status') status?: RequestStatus,
  ): Promise<ServiceRequestResponseDto[]> {
    this.logger.log(`Fetching requests for client: ${user.id}`);
    const requests = await this.serviceRequestsService.getMyRequests(
      user.id,
      status,
    );
    return requests.map((req) => new ServiceRequestResponseDto(req));
  }

  @Get('provider-requests')
  @Roles(UserRole.PROVIDER)
  async getProviderRequests(
    @CurrentUser() user: UserEntity,
    @Query('status') status?: RequestStatus,
  ): Promise<ServiceRequestResponseDto[]> {
    this.logger.log(`Fetching requests for provider: ${user.id}`);
    const requests = await this.serviceRequestsService.getProviderRequests(
      user.id,
      status,
    );
    return requests.map((req) => new ServiceRequestResponseDto(req));
  }

  @Get(':id')
  @Roles(UserRole.CLIENT, UserRole.PROVIDER)
  async getRequestById(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Fetching service request ${id} by user: ${user.id}`);
    const request = await this.serviceRequestsService.getRequestById(
      id,
      user.id,
    );
    return new ServiceRequestResponseDto(request);
  }

  @Put(':id/cancel')
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  async cancelRequest(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelServiceRequestDto,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Cancelling service request ${id} by client: ${user.id}`);
    const request = await this.serviceRequestsService.cancelRequest(
      id,
      user.id,
      dto.reason,
    );

    const info = await this.getRecipientAndTitle(id, user.id);
    if (info) {
      await this.notifyStatusChange(id, 'CANCELLED', user.name, info.recipientUserId, info.title);
    }

    return new ServiceRequestResponseDto(request);
  }

  @Put(':id/accept')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async acceptRequest(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Provider ${user.id} accepting service request ${id}`);
    const request = await this.serviceRequestsService.acceptRequest(
      id,
      user.id,
    );

    const info = await this.getRecipientAndTitle(id, user.id);
    if (info) {
      await this.notifyStatusChange(id, 'ACCEPTED', user.name, info.recipientUserId, info.title);
    }

    return new ServiceRequestResponseDto(request);
  }

  @Put(':id/decline')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async declineRequest(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeclineServiceRequestDto,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Provider ${user.id} declining service request ${id}`);
    const request = await this.serviceRequestsService.declineRequest(
      id,
      user.id,
      dto.reason,
    );

    const info = await this.getRecipientAndTitle(id, user.id);
    if (info) {
      await this.notifyStatusChange(id, 'DECLINED', user.name, info.recipientUserId, info.title);
    }

    return new ServiceRequestResponseDto(request);
  }

  @Put(':id/start')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async startRequest(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Provider ${user.id} starting service request ${id}`);
    const request = await this.serviceRequestsService.startRequest(id, user.id);

    const info = await this.getRecipientAndTitle(id, user.id);
    if (info) {
      await this.notifyStatusChange(id, 'IN_PROGRESS', user.name, info.recipientUserId, info.title);
    }

    return new ServiceRequestResponseDto(request);
  }

  @Put(':id/complete')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async completeRequest(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteServiceRequestDto,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`Provider ${user.id} completing service request ${id}`);
    const request = await this.serviceRequestsService.completeRequest(
      id,
      user.id,
      dto,
    );

    const info = await this.getRecipientAndTitle(id, user.id);
    if (info) {
      await this.notifyStatusChange(id, 'COMPLETED', user.name, info.recipientUserId, info.title);
    }

    return new ServiceRequestResponseDto(request);
  }
}
