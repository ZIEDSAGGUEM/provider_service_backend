import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './application/modules/auth/auth.module';
import { WebhooksModule } from './application/modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    WebhooksModule,
  ],
})
export class AppModule {}
