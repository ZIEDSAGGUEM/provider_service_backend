import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  ICategoryRepository,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../../core/repositories/category.repository.interface';
import { CategoryEntity } from '../../../core/entities/category.entity';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto): Promise<CategoryEntity> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        icon: data.icon,
        description: data.description,
      },
    });

    return new CategoryEntity(category);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    return category ? new CategoryEntity(category) : null;
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });

    return category ? new CategoryEntity(category) : null;
  }

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((c) => new CategoryEntity(c));
  }

  async update(id: string, data: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.prisma.category.update({
      where: { id },
      data,
    });

    return new CategoryEntity(category);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async incrementProviderCount(id: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        providerCount: {
          increment: 1,
        },
      },
    });

    return new CategoryEntity(category);
  }

  async decrementProviderCount(id: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        providerCount: {
          decrement: 1,
        },
      },
    });

    return new CategoryEntity(category);
  }
}

