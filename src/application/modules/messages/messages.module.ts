import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaMessageRepository } from '../../../infrastructure/database/repositories/prisma-message.repository';
import { PrismaServiceRequestRepository } from '../../../infrastructure/database/repositories/prisma-service-request.repository';
import { PrismaProviderRepository } from '../../../infrastructure/database/repositories/prisma-provider.repository';
import { SendMessageUseCase } from '../../../core/use-cases/message/send-message.usecase';
import { GetConversationUseCase } from '../../../core/use-cases/message/get-conversation.usecase';
import { GetConversationsUseCase } from '../../../core/use-cases/message/get-conversations.usecase';
import { GetUnreadCountUseCase } from '../../../core/use-cases/message/get-unread-count.usecase';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PassportModule, AuthModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    PrismaService,
    {
      provide: 'IMessageRepository',
      useClass: PrismaMessageRepository,
    },
    {
      provide: 'IServiceRequestRepository',
      useClass: PrismaServiceRequestRepository,
    },
    {
      provide: 'IProviderRepository',
      useClass: PrismaProviderRepository,
    },
    SendMessageUseCase,
    GetConversationUseCase,
    GetConversationsUseCase,
    GetUnreadCountUseCase,
  ],
  exports: [MessagesService],
})
export class MessagesModule {}

