import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // ── Client: Create Dispute ──
  async create(
    userId: string,
    data: { requestId: string; reason: string; evidence?: string[] },
  ) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: data.requestId },
      include: { provider: { include: { user: true } } },
    });
    if (!request) throw new NotFoundException('Service request not found');
    if (request.clientId !== userId)
      throw new ForbiddenException('Not your request');
    if (!['COMPLETED', 'IN_PROGRESS'].includes(request.status)) {
      throw new BadRequestException(
        'Can only dispute completed or in-progress requests',
      );
    }

    const existing = await this.prisma.dispute.findUnique({
      where: { requestId: data.requestId },
    });
    if (existing)
      throw new BadRequestException('Dispute already exists for this request');

    const dispute = await this.prisma.dispute.create({
      data: {
        requestId: data.requestId,
        raisedById: userId,
        reason: data.reason,
        evidence: data.evidence || [],
        providerEvidence: [],
      },
      include: {
        request: { select: { title: true } },
        raisedBy: { select: { id: true, name: true } },
      },
    });

    // Notify provider
    const notification = await this.notificationsService.create({
      userId: request.provider.userId,
      type: 'DISPUTE_OPENED',
      title: 'Dispute Opened',
      body: `A dispute was opened for "${request.title}"`,
      data: { disputeId: dispute.id, requestId: data.requestId },
    });
    this.eventsGateway.emitNotification(request.provider.userId, notification);

    return dispute;
  }

  // ── Client: Get my disputes ──
  async getClientDisputes(userId: string) {
    return this.prisma.dispute.findMany({
      where: { raisedById: userId },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            provider: {
              include: {
                user: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
        },
        resolvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Provider: Get disputes against me ──
  async getProviderDisputes(userId: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.dispute.findMany({
      where: { request: { providerId: provider.id } },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            client: { select: { id: true, name: true, avatar: true } },
          },
        },
        raisedBy: { select: { id: true, name: true, avatar: true } },
        resolvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Provider: Respond to dispute ──
  async providerRespond(
    userId: string,
    disputeId: string,
    data: { providerResponse: string; providerEvidence?: string[] },
  ) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { request: true },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.request.providerId !== provider.id)
      throw new ForbiddenException('Not your dispute');
    if (dispute.status === 'RESOLVED')
      throw new BadRequestException('Dispute already resolved');

    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        providerResponse: data.providerResponse,
        providerEvidence: data.providerEvidence || [],
        status: 'UNDER_REVIEW',
      },
    });

    // Notify client
    const notification = await this.notificationsService.create({
      userId: dispute.raisedById,
      type: 'DISPUTE_RESPONSE',
      title: 'Provider Responded',
      body: `The provider responded to your dispute for "${dispute.request.title}"`,
      data: { disputeId: dispute.id, requestId: dispute.requestId },
    });
    this.eventsGateway.emitNotification(dispute.raisedById, notification);

    return updated;
  }

  // ── Admin: Get all disputes ──
  async getAllDisputes(status?: string) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    return this.prisma.dispute.findMany({
      where,
      include: {
        request: {
          select: {
            id: true,
            title: true,
            finalPrice: true,
            status: true,
            client: { select: { id: true, name: true, avatar: true } },
            provider: {
              include: {
                user: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
        },
        raisedBy: { select: { id: true, name: true, avatar: true } },
        resolvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: Resolve dispute (simple — no payment) ──
  async resolve(
    adminId: string,
    disputeId: string,
    data: {
      resolution: 'CLIENT_FAVORED' | 'PROVIDER_FAVORED' | 'COMPROMISE';
      adminNote?: string;
    },
  ) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        request: { include: { provider: { include: { user: true } } } },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.status === 'RESOLVED')
      throw new BadRequestException('Already resolved');

    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'RESOLVED',
        resolution: data.resolution,
        adminNote: data.adminNote || null,
        resolvedById: adminId,
      },
    });

    // Notify both parties
    const resolutionLabel =
      data.resolution === 'CLIENT_FAVORED'
        ? 'in your favor'
        : data.resolution === 'PROVIDER_FAVORED'
          ? 'in favor of the provider'
          : 'with a compromise';

    const clientNotif = await this.notificationsService.create({
      userId: dispute.raisedById,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute Resolved',
      body: `Your dispute for "${dispute.request.title}" was resolved ${resolutionLabel}.`,
      data: { disputeId: dispute.id, resolution: data.resolution },
    });
    this.eventsGateway.emitNotification(dispute.raisedById, clientNotif);

    const providerResLabel =
      data.resolution === 'PROVIDER_FAVORED'
        ? 'in your favor'
        : data.resolution === 'CLIENT_FAVORED'
          ? 'in favor of the client'
          : 'with a compromise';

    const providerNotif = await this.notificationsService.create({
      userId: dispute.request.provider.userId,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute Resolved',
      body: `The dispute for "${dispute.request.title}" was resolved ${providerResLabel}.`,
      data: { disputeId: dispute.id, resolution: data.resolution },
    });
    this.eventsGateway.emitNotification(
      dispute.request.provider.userId,
      providerNotif,
    );

    return updated;
  }
}
