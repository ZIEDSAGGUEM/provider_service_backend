import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';
import { MessagesModule } from '../modules/messages/messages.module';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  imports: [
    forwardRef(() => MessagesModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [EventsGateway, PrismaService],
  exports: [EventsGateway],
})
export class EventsModule {}
