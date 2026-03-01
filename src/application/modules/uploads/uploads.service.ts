import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CloudinaryService } from '../../../infrastructure/services/cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const result = await this.cloudinary.upload(file, 'avatars');

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: result.secure_url },
    });

    return { url: result.secure_url };
  }

  async uploadPortfolio(userId: string, file: Express.Multer.File) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');

    const result = await this.cloudinary.upload(file, 'portfolio');

    await this.prisma.provider.update({
      where: { userId },
      data: { portfolio: { push: result.secure_url } },
    });

    return { url: result.secure_url };
  }

  async removePortfolioImage(userId: string, imageUrl: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');

    const updated = provider.portfolio.filter((url) => url !== imageUrl);

    await this.prisma.provider.update({
      where: { userId },
      data: { portfolio: updated },
    });

    return { success: true };
  }
}

