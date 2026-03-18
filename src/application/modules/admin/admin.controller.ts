import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../../core/entities/user.entity';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Dashboard ──
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ── Users ──
  @Get('users')
  async getUsers(@Query('q') q?: string, @Query('role') role?: string) {
    return this.adminService.getUsers(q, role);
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(id, role);
  }

  @Put('users/:id/toggle-verification')
  async toggleUserVerification(@Param('id') id: string) {
    return this.adminService.toggleUserVerification(id);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ── Providers ──
  @Get('providers')
  async getProviders(@Query('q') q?: string, @Query('status') status?: string) {
    return this.adminService.getProviders(q, status);
  }

  @Put('providers/:id/toggle-verification')
  async toggleProviderVerification(@Param('id') id: string) {
    return this.adminService.toggleProviderVerification(id);
  }

  @Put('providers/:id/status')
  async updateProviderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateProviderStatus(id, status);
  }

  // ── Categories ──
  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() data: { name: string; icon: string; description: string },
  ) {
    return this.adminService.createCategory(data);
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() data: { name?: string; icon?: string; description?: string },
  ) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }
}
