import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IUserRepository,
  CreateUserDto,
  UpdateUserDto,
} from '../../../core/repositories/user.repository.interface';
import { UserEntity, UserRole } from '../../../core/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(user: any): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      location: user.location,
      role: user.role as UserRole,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { provider: true },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { provider: true },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        verified: data.verified,
      },
      include: { provider: true },
    });

    return this.mapToEntity(user);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { provider: true },
    });

    return this.mapToEntity(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

