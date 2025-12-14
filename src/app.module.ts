import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContextMiddleware } from './middleware/context';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './cross-cutting/db/prisma.module';
import helmet from 'helmet';
import { AuthModule } from './cross-cutting/auth/auth.module';
import { HealthModule } from './cross-cutting/health/health.module';
import { LoggingModule } from './cross-cutting/logging/logging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    LoggingModule,
    PrismaModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware, helmet()).forRoutes('*');
  }
}
