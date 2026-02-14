import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './application/modules/auth/auth.module';
import { ProvidersModule } from './application/modules/providers/providers.module';
import { CategoriesModule } from './application/modules/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProvidersModule,
    CategoriesModule,
  ],
})
export class AppModule {}
