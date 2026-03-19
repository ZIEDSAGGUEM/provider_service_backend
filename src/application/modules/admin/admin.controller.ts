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
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../../core/entities/user.entity';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateProviderStatusDto } from './dto/update-provider-status.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(@Query('q') q?: string, @Query('role') role?: string) {
    return this.adminService.getUsers(q, role);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Put('users/:id/toggle-verification')
  async toggleUserVerification(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleUserVerification(id);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('providers')
  async getProviders(@Query('q') q?: string, @Query('status') status?: string) {
    return this.adminService.getProviders(q, status);
  }

  @Put('providers/:id/toggle-verification')
  async toggleProviderVerification(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleProviderVerification(id);
  }

  @Put('providers/:id/status')
  async updateProviderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProviderStatusDto,
  ) {
    return this.adminService.updateProviderStatus(id, dto.status);
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCategory(id);
  }
}
