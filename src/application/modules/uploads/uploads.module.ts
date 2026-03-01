import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { CloudinaryService } from '../../../infrastructure/services/cloudinary.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  controllers: [UploadsController],
  providers: [UploadsService, CloudinaryService, PrismaService],
  exports: [CloudinaryService],
})
export class UploadsModule {}

