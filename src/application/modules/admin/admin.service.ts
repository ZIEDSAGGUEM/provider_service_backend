import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Platform Stats ──
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalUsers,
      totalProviders,
      totalRequests,
      totalRevenue,
      newUsersThisMonth,
      requestsByStatus,
      monthlySignups,
      monthlyRequests,
      topCategories,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.provider.count(),
      this.prisma.serviceRequest.count(),
      this.prisma.serviceRequest.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { finalPrice: true },
      }),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.serviceRequest.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      this.prisma.serviceRequest.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, status: true, finalPrice: true },
      }),
      this.prisma.category.findMany({
        select: { name: true, icon: true, providerCount: true },
        orderBy: { providerCount: 'desc' },
        take: 6,
      }),
    ]);

    const statusCounts: Record<string, number> = {
      PENDING: 0, ACCEPTED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0,
    };
    for (const r of requestsByStatus) statusCounts[r.status] = r._count;

    // Monthly chart
    const monthlyChart: { month: string; signups: number; requests: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      let signups = 0;
      let requests = 0;
      let revenue = 0;

      for (const u of monthlySignups) {
        const c = new Date(u.createdAt);
        if (c >= monthStart && c <= monthEnd) signups++;
      }
      for (const r of monthlyRequests) {
        const c = new Date(r.createdAt);
        if (c >= monthStart && c <= monthEnd) {
          requests++;
          if (r.status === 'COMPLETED' && r.finalPrice) revenue += r.finalPrice;
        }
      }
      monthlyChart.push({ month: label, signups, requests, revenue });
    }

    return {
      totalUsers,
      totalProviders,
      totalRequests,
      totalRevenue: totalRevenue._sum.finalPrice || 0,
      newUsersThisMonth,
      statusCounts,
      monthlyChart,
      topCategories,
    };
  }

  // ── Users ──
  async getUsers(query?: string, role?: string) {
    const where: any = {};
    if (role) where.role = role;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, avatar: true, phone: true,
        location: true, role: true, verified: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new BadRequestException('Cannot change admin role');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, email: true, name: true, role: true, verified: true },
    });
  }

  async toggleUserVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { verified: !user.verified },
      select: { id: true, email: true, name: true, verified: true },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new BadRequestException('Cannot delete admin');

    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }

  // ── Providers ──
  async getProviders(query?: string, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (query) {
      where.user = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.provider.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        category: { select: { id: true, name: true, icon: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleProviderVerification(providerId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.provider.update({
      where: { id: providerId },
      data: { verified: !provider.verified },
      select: { id: true, verified: true },
    });
  }

  async updateProviderStatus(providerId: string, status: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.provider.update({
      where: { id: providerId },
      data: { status: status as any },
      select: { id: true, status: true },
    });
  }

  // ── Categories ──
  async createCategory(data: { name: string; icon: string; description: string }) {
    const existing = await this.prisma.category.findUnique({ where: { name: data.name } });
    if (existing) throw new BadRequestException('Category already exists');

    return this.prisma.category.create({ data });
  }

  async updateCategory(id: string, data: { name?: string; icon?: string; description?: string }) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { providers: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    if (category._count.providers > 0) {
      throw new BadRequestException('Cannot delete category with active providers');
    }

    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }
}

