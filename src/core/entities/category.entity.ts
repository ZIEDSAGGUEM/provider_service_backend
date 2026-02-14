export class CategoryEntity {
  id: string;
  name: string;
  icon: string;
  description: string;
  providerCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<CategoryEntity>) {
    Object.assign(this, data);
  }
}

