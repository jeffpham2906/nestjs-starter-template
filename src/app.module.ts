import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './cross-cutting/db/prisma.module';
import helmet from 'helmet';
import { AuthModule } from './cross-cutting/auth/auth.module';
import { HealthModule } from './cross-cutting/health/health.module';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        genReqId: (req) => {
          const requestId =
            req.headers['x-request-id'] ||
            req.headers['x-correlation-id'] ||
            randomUUID();
          req.headers['x-request-id'] = requestId;
          return requestId;
        },
        quietReqLogger: true,
        quietResLogger: true,
        transport:
          process.env.NODE_ENV === 'development'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet()).forRoutes('*');
  }
}
