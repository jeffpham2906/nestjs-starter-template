import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './cross-cutting/db/prisma.module';
import helmet from 'helmet';
import { AuthModule } from './cross-cutting/auth/auth.module';
import { HealthModule } from './cross-cutting/health/health.module';
import { validateConfig } from './cross-cutting/config/config.validation';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './cross-cutting/validation/filters/global-exception.filter';
import { ZodValidationExceptionFilter } from './cross-cutting/validation/filters/zod-validation-exception.filter';
import { LoggingModule } from './cross-cutting/logging/logging.module';
import { SpecimenManagementModule } from './features/specimen-management/specimen-management.module';
import { ValidationModule } from './cross-cutting/validation/validation.module';
import { UtilitiesModule } from './cross-cutting/providers/utilities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: validateConfig,
    }),
    LoggingModule,
    PrismaModule,
    AuthModule,
    HealthModule,
    SpecimenManagementModule,
    ValidationModule,
    UtilitiesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet()).forRoutes('*');
  }
}
