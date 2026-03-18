import { Module } from '@nestjs/common';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { EventsModule } from '../../gateways/events.module';

@Module({
  imports: [EventsModule],
  controllers: [DisputesController],
  providers: [DisputesService, PrismaService],
})
export class DisputesModule {}
