import { Injectable, Inject } from '@nestjs/common';
import type { ICategoryRepository } from '../../../core/repositories/category.repository.interface';
import { CategoryEntity } from '../../../core/entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async getAllCategories(): Promise<CategoryEntity[]> {
    return await this.categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }
}

