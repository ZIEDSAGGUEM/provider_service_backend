import { CategoryEntity } from '../entities/category.entity';

export interface CreateCategoryDto {
  name: string;
  icon: string;
  description: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  description?: string;
  providerCount?: number;
}

export interface ICategoryRepository {
  create(data: CreateCategoryDto): Promise<CategoryEntity>;
  findById(id: string): Promise<CategoryEntity | null>;
  findByName(name: string): Promise<CategoryEntity | null>;
  findAll(): Promise<CategoryEntity[]>;
  update(id: string, data: UpdateCategoryDto): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;
  incrementProviderCount(id: string): Promise<CategoryEntity>;
  decrementProviderCount(id: string): Promise<CategoryEntity>;
}

