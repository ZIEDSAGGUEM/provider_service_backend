import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaNotificationRepository } from '../../../infrastructure/database/repositories/prisma-notification.repository';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [PassportModule, AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PrismaService,
    { provide: 'INotificationRepository', useClass: PrismaNotificationRepository },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

