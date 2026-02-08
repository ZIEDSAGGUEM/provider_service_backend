import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaUserRepository } from '../../../infrastructure/database/repositories/prisma-user.repository';
import { EmailService } from '../../../infrastructure/services/email.service';
import { GetUserUseCase } from '../../../core/use-cases/auth/get-user.usecase';

const IUserRepository = 'IUserRepository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    EmailService,
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
    GetUserUseCase,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
