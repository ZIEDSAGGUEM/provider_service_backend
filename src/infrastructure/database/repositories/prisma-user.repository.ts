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
      password: user.password,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      location: user.location,
      role: user.role as UserRole,
      verified: user.verified,
      verificationToken: user.verificationToken,
      verificationTokenExpiry: user.verificationTokenExpiry,
      passwordResetToken: user.passwordResetToken,
      passwordResetTokenExpiry: user.passwordResetTokenExpiry,
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

  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
      include: { provider: true },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findByPasswordResetToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: token },
      include: { provider: true },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        verified: data.verified ?? false,
        verificationToken: data.verificationToken,
        verificationTokenExpiry: data.verificationTokenExpiry,
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
