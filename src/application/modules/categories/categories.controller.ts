import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Get all categories (Public)
   * GET /api/categories
   */
  @Get()
  async getAllCategories() {
    console.log('📋 Get all categories request');
    return await this.categoriesService.getAllCategories();
  }

  /**
   * Get category by ID (Public)
   * GET /api/categories/:id
   */
  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    console.log('📋 Get category request:', { id });
    
    try {
      return await this.categoriesService.getCategoryById(id);
    } catch (error) {
      console.error('❌ Get category error:', error.message);
      throw new NotFoundException(error.message);
    }
  }
}

