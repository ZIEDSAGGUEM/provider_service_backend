export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum ProviderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface AvailabilitySchedule {
  [key: string]: string[]; // e.g., { "monday": ["9:00-17:00", "18:00-20:00"], "tuesday": [...] }
}

export class ProviderEntity {
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

  user?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
    phone?: string | null;
    location?: string | null;
  } | null;
  category?: {
    id: string;
    name: string;
    icon: string;
    description?: string;
  } | null;

  constructor(data: Partial<ProviderEntity>) {
    Object.assign(this, data);
  }
}
