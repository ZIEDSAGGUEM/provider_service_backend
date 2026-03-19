import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from '../../../core/entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(): Promise<CategoryEntity[]> {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  async getCategoryById(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryEntity> {
    return this.categoriesService.getCategoryById(id);
  }
}
