import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaServiceRequestRepository } from '../../../infrastructure/database/repositories/prisma-service-request.repository';
import { PrismaUserRepository } from '../../../infrastructure/database/repositories/prisma-user.repository';
import { PrismaProviderRepository } from '../../../infrastructure/database/repositories/prisma-provider.repository';
import { PrismaCategoryRepository } from '../../../infrastructure/database/repositories/prisma-category.repository';
import { CreateServiceRequestUseCase } from '../../../core/use-cases/service-request/create-service-request.usecase';
import { GetServiceRequestUseCase } from '../../../core/use-cases/service-request/get-service-request.usecase';
import { ListClientRequestsUseCase } from '../../../core/use-cases/service-request/list-client-requests.usecase';
import { ListProviderRequestsUseCase } from '../../../core/use-cases/service-request/list-provider-requests.usecase';
import { CancelServiceRequestUseCase } from '../../../core/use-cases/service-request/cancel-service-request.usecase';
import { AcceptServiceRequestUseCase } from '../../../core/use-cases/service-request/accept-service-request.usecase';
import { DeclineServiceRequestUseCase } from '../../../core/use-cases/service-request/decline-service-request.usecase';
import { StartServiceRequestUseCase } from '../../../core/use-cases/service-request/start-service-request.usecase';
import { CompleteServiceRequestUseCase } from '../../../core/use-cases/service-request/complete-service-request.usecase';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../../gateways/events.module';

@Module({
  imports: [PassportModule, AuthModule, EventsModule],
  controllers: [ServiceRequestsController],
  providers: [
    ServiceRequestsService,
    PrismaService,
    { provide: 'IServiceRequestRepository', useClass: PrismaServiceRequestRepository },
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
    { provide: 'IProviderRepository', useClass: PrismaProviderRepository },
    { provide: 'ICategoryRepository', useClass: PrismaCategoryRepository },
    CreateServiceRequestUseCase,
    GetServiceRequestUseCase,
    ListClientRequestsUseCase,
    ListProviderRequestsUseCase,
    CancelServiceRequestUseCase,
    AcceptServiceRequestUseCase,
    DeclineServiceRequestUseCase,
    StartServiceRequestUseCase,
    CompleteServiceRequestUseCase,
  ],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
