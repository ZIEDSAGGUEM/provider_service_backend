import { ProviderEntity, AvailabilityStatus, ProviderStatus, AvailabilitySchedule } from '../../../../core/entities/provider.entity';

export class ProviderResponseDto {
  id: string;
  userId: string;
  categoryId: string;
  bio?: string | null;
  hourlyRate: number;
  skills: string[];
  availability: AvailabilityStatus;
  availabilitySchedule?: AvailabilitySchedule | null;
  verified: boolean;
  yearsExperience: number;
  completedJobs: number;
  responseTime: string;
  rating: number;
  reviewCount: number;
  serviceRadius: number;
  portfolio: string[];
  certifications: string[];
  status: ProviderStatus;
  createdAt: Date;
  updatedAt: Date;

  // User info (if populated)
  user?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
    phone?: string | null;
    location?: string | null;
  };

  // Category info (if populated)
  category?: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };

  constructor(provider: ProviderEntity) {
    this.id = provider.id;
    this.userId = provider.userId;
    this.categoryId = provider.categoryId;
    this.bio = provider.bio;
    this.hourlyRate = provider.hourlyRate;
    this.skills = provider.skills;
    this.availability = provider.availability;
    this.availabilitySchedule = provider.availabilitySchedule;
    this.verified = provider.verified;
    this.yearsExperience = provider.yearsExperience;
    this.completedJobs = provider.completedJobs;
    this.responseTime = provider.responseTime;
    this.rating = provider.rating;
    this.reviewCount = provider.reviewCount;
    this.serviceRadius = provider.serviceRadius;
    this.portfolio = provider.portfolio;
    this.certifications = provider.certifications;
    this.status = provider.status;
    this.createdAt = provider.createdAt;
    this.updatedAt = provider.updatedAt;

    if (provider.user) {
      this.user = {
        id: provider.user.id,
        name: provider.user.name,
        email: provider.user.email,
        avatar: provider.user.avatar,
        phone: provider.user.phone,
        location: provider.user.location,
      };
    }

    if (provider.category) {
      this.category = {
        id: provider.category.id,
        name: provider.category.name,
        icon: provider.category.icon,
        description: provider.category.description,
      };
    }
  }
}

