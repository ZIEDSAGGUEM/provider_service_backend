import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaCategoryRepository } from '../../../infrastructure/database/repositories/prisma-category.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    PrismaService,
    {
      provide: 'ICategoryRepository',
      useClass: PrismaCategoryRepository,
    },
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}

