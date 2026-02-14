import { ProviderEntity, ProviderStatus, AvailabilityStatus, AvailabilitySchedule } from '../entities/provider.entity';

export interface CreateProviderDto {
  userId: string;
  categoryId: string;
  bio?: string | null;
  hourlyRate: number;
  skills: string[];
  availability?: AvailabilityStatus;
  availabilitySchedule?: AvailabilitySchedule | null;
  yearsExperience?: number;
  serviceRadius?: number;
  portfolio?: string[];
  certifications?: string[];
}

export interface UpdateProviderDto {
  categoryId?: string;
  bio?: string | null;
  hourlyRate?: number;
  skills?: string[];
  availability?: AvailabilityStatus;
  availabilitySchedule?: AvailabilitySchedule | null;
  yearsExperience?: number;
  responseTime?: string;
  serviceRadius?: number;
  portfolio?: string[];
  certifications?: string[];
  status?: ProviderStatus;
  verified?: boolean;
}

export interface ProviderSearchFilters {
  categoryId?: string;
  minRating?: number;
  maxHourlyRate?: number;
  skills?: string[];
  availability?: AvailabilityStatus;
  status?: ProviderStatus;
  verified?: boolean;
  location?: string;
  serviceRadius?: number;
}

export interface IProviderRepository {
  create(data: CreateProviderDto): Promise<ProviderEntity>;
  findById(id: string): Promise<ProviderEntity | null>;
  findByUserId(userId: string): Promise<ProviderEntity | null>;
  findAll(filters?: ProviderSearchFilters): Promise<ProviderEntity[]>;
  update(id: string, data: UpdateProviderDto): Promise<ProviderEntity>;
  delete(id: string): Promise<void>;
  updateRating(id: string, rating: number, reviewCount: number): Promise<ProviderEntity>;
  incrementCompletedJobs(id: string): Promise<ProviderEntity>;
}

